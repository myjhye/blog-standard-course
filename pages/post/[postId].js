// 답변 페이지

import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import clientPromise from '../../lib/mongodb';
import { ObjectId } from "mongodb";
import Markdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";

export default function Post(props) {
    
    return (
        <div className="overflow-auto h-full">
            <div className="max-w-screen-sm mx-auto">

                {/* SEO 관련 정보 */}
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    SEO title and meta description
                </div>
                <div className="p-4 my-2 border border-stone-200 rounded-md">
                    <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
                    <div className="mt-2">{props.metaDescription}</div>
                </div>

                {/* 키워드 */}
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    Keywords
                </div>
                <div className="flex flex-wrap pt-2 gap-1">
                    {props.keywords.split(",").map((keyword, i) => (
                        <div 
                            key={i}
                            className="p-2 rounded-full bg-slate-800 text-white"
                        >
                            <FontAwesomeIcon 
                                icon={faHashtag}
                                className="mr-1" 
                            />
                            {keyword}
                        </div>
                    ))}
                </div>

                {/* 답변(마크다운 형식) */}
                <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
                    Blog post
                </div>
                <Markdown>
                    {props.postContent || ""}
                </Markdown>
            </div>
        </div>
    )
}

// 공통 레이아웃
Post.getLayout = function getLayout(page, pageProps) {
    return (
        <AppLayout {...pageProps}>
            {page}
        </AppLayout>
    )
}


// 공통 데이터와 특정 데이터 가져오기
export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx) {
      
      // 공통 데이터 - 프로필 
      const props = await getAppProps(ctx);
      
      const client = await clientPromise;
      const db = client.db('BlogStandard');
      
      const userSession = await getSession(ctx.req, ctx.res);
      const user = await db.collection('users').findOne({
        auth0Id: userSession.user.sub,
      });

      // 특정 데이터 - 게시물 내용, 제목, 메타설명, 생성 날짜 등
      const post = await db.collection('posts').findOne({
        _id: new ObjectId(ctx.params.postId),
        userId: user._id,
      });
  

      // 게시물 없으면 새 질문 작성 페이지로 이동
      if (!post) {
        return {
          redirect: {
            destination: '/post/new',
            permanent: false,
          },
        };
      }
  
      return {
        props: {
          id: ctx.params.postId,
          postContent: post.postContent,
          title: post.title,
          metaDescription: post.metaDescription,
          keywords: post.keywords,
          postCreated: post.created.toString(),
          // 공통 데이터
          ...props,
        },
      };
    },
  });