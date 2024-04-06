// 답변 생성 토큰 추가

import { getSession } from "@auth0/nextjs-auth0"
import clientPromise from '../../lib/mongodb';

export default async function heandler(req, res) {

    const { user } = await getSession(req, res);

    // mongo db 인스턴스
    const client = await clientPromise;
    // BlogStandard 데이터베이스에 연결
    const db = client.db("BlogStandard");

    
    const userProfile = await db.collection("users").updateOne(
        // "users" 테이블에 사용자의 auth0Id를 찾아 availableTokens을 10 증가
        {
            auth0Id: user.sub
        },
        // $inc: 값 증가
        // $setOnInsert: 없는 경우만 추가하고, 있으면 그냥 두기
        {
            $inc: {
                availableTokens: 10
            },
            $setOnInsert: {
                auth0Id: user.sub
            },
        },
        // 해당 사용자가 없는 경우 신규 추가
        {
            upsert: true
        },
    );

    res.status(200).json({})
}