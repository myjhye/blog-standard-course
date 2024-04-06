// 토큰 수, 게시물 데이터, 게시물 ID 가져오기 - 세션, 게시물 콜렉션, params에서 추출 - 공통적으로 필요한 데이터

import { getSession } from "@auth0/nextjs-auth0"
import clientPromise from "../lib/mongodb";

export const getAppProps = async (ctx) => {
    const userSession = await getSession(ctx.req, ctx.res);
    
    const client = await clientPromise;
    const db = client.db('BlogStandard');
    
    // users 컬렉션에서 현재 사용자 조회
    const user = await db.collection('users').findOne({
        auth0Id: userSession.user.sub,
    });

    if (!user) {
        return {
            availableTokens: 0,
            posts: [],
        };
    }

    // 최신 5개 게시물 조회
    const posts = await db
    .collection('posts')
    .find({
      userId: user._id,
    })
    .limit(5)
    .sort({
      created: -1,
    })
    .toArray();


  // 최종적으로 반환하는 객체 - 토큰 수, 게시물, 게시물id
  return {
    availableTokens: user.availableTokens,
    posts: posts.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      userId: userId.toString(),
      // 기타 모든 게시물 데이터
      ...rest,
    })),
    // 현재 게시물의 postId
    postId: ctx.params?.postId || null,
  };
};