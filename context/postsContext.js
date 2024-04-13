// 여러 컴포넌트에 데이터 공유

import React, { useCallback, useState } from 'react'

// PostContext에 데이터를 담아 여러 컴포넌트에 전달
const PostContext = React.createContext({});

export default PostContext;

export const PostsProvider = ({ children }) => {

    // 게시물
    const [posts, setPosts] = useState([]);
    // 로드할 게시물 없음
    const [noMorePosts, setNoMorePosts] = useState(false);


    //-------- 초반 게시물 5개 조회(서버사이드 처리)
    const setPostsFromSSR = useCallback((postsFromSSR = []) => {
        // 서버 사이드에서 가져온 게시물 데이터
        // setPosts(postsFromSSR);

        setPosts((value) => {
            const newPosts = [...value];
            postsFromSSR.forEach((post) => {
                const exists = newPosts.find((p) => p._id === post._id);
                if (!exists) {
                    newPosts.push(post);
                }
            });
            return newPosts;
        });
    }, []);

    //-------- 추가 로딩 게시물 5개(중복X) 게시물 조회
    const getPosts = useCallback(async ({ lastPostDate, getNewerPosts = false }) => {
        const result = await fetch(`/api/getPosts`, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify({ lastPostDate, getNewerPosts })
        });

        // 서버 응답을 json 형식으로 받기
        const json = await result.json();
        // 응답에서 게시물 데이터 추출
        const postsResult = json.posts || [];
        console.log("post result!!", postsResult);

        // 받아온 게시물이 5개 미만일 경우 더 이상 로드할 게시물이 없다고 표시
        if (postsResult.length < 5) {
            setNoMorePosts(true);
        };

        // 추가 로딩 게시물 5개(중복X) 상태에 적용
        setPosts((value) => {
            const newPosts = [...value];
            postsResult.forEach((post) => {
                const exists = newPosts.find((p) => p._id === post._id);
                if (!exists) {
                    newPosts.push(post);
                }
            });
            // 게시물 반환해 상태 적용
            return newPosts;
        });

    }, []);

    return (
        <PostContext.Provider value={{posts, setPostsFromSSR, getPosts, noMorePosts }}>
            {children}
        </PostContext.Provider>
    )
}   