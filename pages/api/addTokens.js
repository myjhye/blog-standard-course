// 토큰 추가 처리

import { getSession } from "@auth0/nextjs-auth0"
import stripeInit from "stripe";

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);

export default async function heandler(req, res) {

    const { user } = await getSession(req, res);

    // 결제할 항목 - 가격, 수량
    const lineItems = [{
        price: process.env.STRIPE_PRODUCT_PRICE_ID,
        quantity: 1,
    }];

    // 개발 환경인지 프로덕션 환경인지에 따라 프로토콜 정의
    const protocol = process.env.NODE_ENV === 'development' ? "http://" : "https://";
    
    // 요청 헤더에서 호스트 정보 가져오기 - localhost:3000
    const host = req.headers.host;

    // stripe checkout 세션 생성 - 결제 항목, 결제 방식, 성공 시 이동되는 url
    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: `${protocol}${host}/success`,
        payment_intent_data: {
            metadata: {
                sub: user.sub
            },
        },
        metadata: {
            sub: user.sub,
        },
    });

    res.status(200).json({ session: checkoutSession });
}