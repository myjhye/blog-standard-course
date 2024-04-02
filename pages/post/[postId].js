import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function Post() {
    return (
        <div>
            post!!
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {},
    };
});