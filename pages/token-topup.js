// 토큰 추가 버튼

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function TokenTopup() {
    
    // 토큰 추가 처리
    const handleClick = async () => {
        const result = await fetch(`/api/addTokens`, {
            method: 'POST',
        });

        // 응답 json 데이터 파싱 
        const json = await result.json();
        // 결제 세션 url로 이동 - 결제 프로세스 진행
        window.location.href = json.session.url;
    };
    
    return (
        <div>
            <h1>token top up!!</h1>
            <button
                className="btn"
                onClick={handleClick}
            >
                add token
            </button>
        </div>
    )
}

// 공통 레이아웃
// pageProps에 props 데이터 전달
TokenTopup.getLayout = function getLayout(page, pageProps) {
    return (
        <AppLayout {...pageProps}>
            {page}
        </AppLayout>
    )
}

// getAppProps에서 토큰 수, 게시물 데이터(생성날짜, 게시물id, 생성자id) 가져와서 props에 쟁여두기
export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx) {
        const props = await getAppProps(ctx);
        return {
            props,
        };
    },
});