// 질문 생성 페이지

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

export default function NewPost(props) {

    // 주제(질문)
    const [topic, setTopic] = useState("");
    // 키워드
    const [keywords, setKeywords] = useState("");
    const [generating, setGenerating] = useState(false);

    const router = useRouter();

    // 질문 제출
    const handleSubmit = async (e) => {

        // 새로고침 안되게
        e.preventDefault(e);

        setGenerating(true);

        try {
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
        } catch (e) {
            setGenerating(false);
        };
    };

    return (
        <div className="h-full overflow-hidden">
            {!!generating && (
                <div className="text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center">
                    <FontAwesomeIcon 
                        icon={faBrain}
                        className="text-8xl" 
                    />
                    <h6>Generating..</h6>
                </div>
            )}
            {!generating && (
                <div className="w-full h-full flex flex-col overflow-auto">
                    <form 
                        onSubmit={handleSubmit}
                        className="m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200"
                    >
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
                            <small className="block mb-2">
                                Separate keywords with a comma
                            </small>
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
            )}
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

        // 토큰 없으면 토큰 충전 페이지로 이동
        if (!props.availableTokens) {
            return {
                redirect: {
                    destination: "/token-topup",
                    permanent:false,
                },
            };
        }

        return {
            props,
        }
    },
});