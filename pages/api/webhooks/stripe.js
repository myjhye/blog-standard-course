import Cors from 'micro-cors';
import stripeInit from 'stripe';
import verifyStripe from '@webdeveducation/next-verify-stripe';
import clientPromise from '../../../lib/mongodb';

const cors = Cors({
    allowMethods: ['POST', 'HEAD']
});

export const config = {
    api: {
        bodyParder: false
    }
};

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {
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
            case 'payment_intent.succeeded': {
                // mongo db 인스턴스
                const client = await clientPromise;
                // BlogStandard 데이터베이스에 연결
                const db = client.db("BlogStandard");

                const paymentIntent = event.data.object;
                const auth0Id = paymentIntent.metadata.sub;
                
                const userProfile = await db.collection("users").updateOne(
                    // "users" 테이블에 사용자의 auth0Id를 찾아 availableTokens을 10 증가
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

            default:
                console.log("UNHANDLED EVENT!!: ", event.type);
        }

        res.status(200).json({ received: true });
    } 
};

export default cors(handler);