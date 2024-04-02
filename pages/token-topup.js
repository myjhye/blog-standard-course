import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function TokenTopup() {
    return (
        <div>
            token top up!!
        </div>
    )
}

export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {},
    };
});