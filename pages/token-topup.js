import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";

export default function TokenTopup() {
    
    const handleClick = async () => {
        await fetch(`/api/addTokens`, {
            method: 'POST',
        });
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
TokenTopup.getLayout = function getLayout(page, pageProps) {
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