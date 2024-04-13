// 추가 로딩 게시물 5개 조회 API

import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
    
    try {
        const { user: { sub } } = await getSession(req, res);
        const client = await clientPromise;
        const db = client.db("BlogStandard");
        const userProfile = await db.collection("users").findOne({
            auth0Id: sub
        });

        const { lastPostDate } = req.body;

        // posts 컬렉션에서 이전 게시물 찾기
        // 현재 사용자가 업로드한, 요청된 마지막 날짜보다 이전인 것
        const posts = await db
            .collection("posts")
            .find({
                userId: userProfile._id,
                created: {$lt: new Date(lastPostDate)},
            })
            // 최대 5개 게시물
            .limit(5)
            // 생성날짜에서 내림차순 정렬
            .sort({ created: -1 })
            .toArray();

            // 검색된 게시물을 json 형태로 응답
            res.status(200).json({ posts });
            return;

    } catch (e) {

    }
})