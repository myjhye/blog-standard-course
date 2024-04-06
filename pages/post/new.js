// 질문 생성 페이지

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";

export default function NewPost(props) {

    // 주제(질문)
    const [topic, setTopic] = useState("");
    // 키워드
    const [keywords, setKeywords] = useState("");

    const router = useRouter();

    // 질문 제출
    const handleSubmit = async (e) => {

        // 새로고침 안되게
        e.preventDefault(e);

        // 질문 처리 
        const response = await fetch(`/api/generatePost`, {
            method: "POST",
            headers: {
                'content-type': 'application/json',
            },
            // 입력한 질문, 키워드 보내기
            body: JSON.stringify({ topic, keywords }),
        });

        // 응답
        const json = await response.json();

        // 생성된 postId를 사용해 해당 게시물의 페이지로 이동
        if (json?.postId) {
            router.push(`/post/${json.postId}`);
        };
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {/* 질문 입력 */}
                <div>
                    <label>
                        <strong>
                            Generate a blog post on the topic of:
                        </strong>
                    </label>
                    <textarea
                        className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>
                {/* 키워드 입력 */}
                <div>
                    <label>
                        <strong>
                            Targeting the following keywords:
                        </strong>
                    </label>
                    <textarea
                        className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"  
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                </div>
                {/* 게시물 생성 버튼 */}
                <button
                    type="submit" 
                    className="btn"
                >
                    generate
                </button>
            </form>
        </div>
    )
}

// 공통 레이아웃
NewPost.getLayout = function getLayout(page, pageProps) {
    return (
        <AppLayout {...pageProps}>
            {page}
        </AppLayout>
    )
}

export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx) {
        const props = await getAppProps(ctx);
        return {
            props,
        };
    },
});