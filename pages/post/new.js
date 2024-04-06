import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import Markdown from "react-markdown";

export default function NewPost(props) {

    const [topic, setTopic] = useState("");
    const [keywords, setKeywords] = useState("");
    const [postContent, setPostContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(e);
        const response = await fetch(`/api/generatePost`, {
            method: "POST",
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ topic, keywords }),
        });
        const json = await response.json();
        setPostContent(json.post.postContent);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
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
                <button
                    type="submit" 
                    className="btn"
                >
                    generate
                </button>
            </form>
            <Markdown>
                {postContent}
            </Markdown>
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

export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {},
    };
});