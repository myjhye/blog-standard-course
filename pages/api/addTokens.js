// 토큰 결제 처리 - 클라이언트 사이드

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

    // 결제 요청 보내고, 결제 성공 시 해당 세션 응답 받기
    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: `${protocol}${host}/success`,
        // 결제 성공 후 결제한 사용자의 아이디(user.sub) 저장
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