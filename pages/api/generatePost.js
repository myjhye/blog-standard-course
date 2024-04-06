import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { OpenAIApi, Configuration } from "openai"
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {

    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db('BlogStandard');
    const userProfile = await db.collection('users').findOne({
      auth0Id: user.sub,
    });

    if (!userProfile?.availableTokens) {
      res.status(403);
      return;
    }

    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(config);

    const { topic, keywords } = req.body;

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

    const postContent = response.data.choices[0]?.message?.content;
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

    const { title, metaDescription } = seoResponse.data.choices[0].message.content;

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

  