// stripe webhook으로 토큰 결제 처리 - 서버 사이드

import Cors from 'micro-cors';
import stripeInit from 'stripe';
import verifyStripe from '@webdeveducation/next-verify-stripe';
import clientPromise from '../../../lib/mongodb';

// cors 설정 - POST와 HEAD 메서드만 허용
const cors = Cors({
    allowMethods: ['POST', 'HEAD']
});

// api 구성 설정 - bodyparser 사용X
export const config = {
    api: {
        bodyParder: false
    }
};

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// 비동기 핸들러 함수 - http 요청을 처리하고 응답
const handler = async (req, res) => {

    // POST 메서드에만 반응
    if (req.method === 'POST') {
        let event;
        try {
            event = verifyStripe({
                req,
                stripe,
                endpointSecret,
            })
        } catch(e) {
            console.log("Error!!", e);
        };

        switch(event.type) {
            // 결제 성공 시 처리
            case 'payment_intent.succeeded': {
                // mongo db 인스턴스
                const client = await clientPromise;
                // BlogStandard 데이터베이스에 연결
                const db = client.db("BlogStandard");

                const paymentIntent = event.data.object;
                const auth0Id = paymentIntent.metadata.sub;
                
                // 'users' 컬렉션에 사용자의 auth0Id를 찾아 토큰 수 업데이트 (10+증가)
                const userProfile = await db.collection("users").updateOne(
                    {
                        auth0Id,
                    },
                    // $inc: 값 증가
                    // $setOnInsert: 없는 경우만 추가하고, 있으면 그냥 두기
                    {
                        $inc: {
                            availableTokens: 10
                        },
                        $setOnInsert: {
                            auth0Id,
                        },
                    },
                    // 해당 사용자가 없는 경우 신규 추가
                    {
                        upsert: true
                    },
                );
            }

            // 처리되지 않은 이벤트에 대한 기본 동작
            default:
                console.log("UNHANDLED EVENT!!: ", event.type);
        }

        // 요청을 성공적으로 받았다는 응답을 클라이언트에게 보내기
        res.status(200).json({ received: true });
    } 
};

// cors 미들웨어를 사용해 핸들러 함수 보내기
export default cors(handler);