/*
1. 인증
2. mongodb로 데이터 저장
3. openAi API 사용해 내용 생성
*/

import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { OpenAIApi, Configuration } from "openai"
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {

    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db('BlogStandard');

    // 현재 사용자 정보 가져오기
    const userProfile = await db.collection('users').findOne({
      auth0Id: user.sub,
    });

    // 사용자의 토큰 없으면 에러
    if (!userProfile?.availableTokens) {
      res.status(403);
      return;
    }

    // openAI API 사용을 위한 설정
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(config);

    // 요청 본문에서 topic, keywords 추출
    const { topic, keywords } = req.body;

    // topic 또는 keyword 입력이 없거나, 길이가 80을 초과하는 경우 에러 
    if (!topic || !keywords || topic.length > 80 || keywords.length > 80) {
      res.status(422);
      return;
    };


    // 포스트 내용 생성
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are an SEO friendly blog post generator called BlogStadard. You are designed to output markdown without frontmatter.",
        },
        {
          role: "user",
          content: `
            Generate me a long and detailed seo friendly blog post on the following topic delimited by triple hyhens:
            ---
            ${topic}
            ---
            Targeting the following comma separated keywords delimited by triple hyphens:
            ---
            ${keywords}
            ---
          `
        }
      ],
    });

    // openAI 응답에서 포스트 내용 추출
    const postContent = response.data.choices[0]?.message?.content;
    
    // 포스트 내용을 기반으로 SEO 친화적인 제목, 메타 설명 생성
    const seoResponse = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "You are an SEO friendly blog post generator called BlogStadard. You are designed to output JSON. Do not include HTML tags in your output."
          },
          { 
            role: "user",
            content: `
              Generate an SEO friendly title and SEO friendly meta description for the following blog post:
              ${postContent}
              ---
              The output json must be in the following format:
              {
                title: "example title",
                metaDescription: "example meta description"
              }
            `,
          },
        ],
        response_format: { type: "json_object" },
      });

    console.log(seoResponse.data.choices[0].message.content);

    // SEO 응답에서 제목, 메타 설명 추출
    const { title, metaDescription } = seoResponse.data.choices[0].message.content;

    // 사용자 토큰 수 감소시키고
    // 변경 사항을 데이터베이스에 저장
    await db.collection("users").updateOne(
      {
        auth0Id: user.sub
      },
      {
        $inc: {
          availableTokens: -1
        },
      },
    );

    // 새로운 내용을 'posts' 컬렉션에 저장
    const post = await db.collection('posts').insertOne({
      postContent: postContent || '',
      title: title || '',
      metaDescription: metaDescription || '',
      topic,
      keywords,
      userId: userProfile._id,
      created: new Date(),
    });

    res.status(200).json({ 
      postId: post.insertedId
    });
});

  