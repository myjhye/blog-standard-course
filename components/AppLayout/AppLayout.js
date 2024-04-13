// 사이드바 (여러 페이지에 공통 적용)

import Link from "next/link";
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from "next/image";
import { Logo } from '../Logo';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect } from "react";
import PostsContext from '../../context/postsContext';

export const AppLayout = ({ 
    children, 
    availableTokens, 
    posts: postsFromSSR, 
    postId,
    postCreated 
}) => {

    // 현재 사용자
    const { user } = useUser();

    const { 
        setPostsFromSSR, 
        posts,
        getPosts,
        noMorePosts, 
    } = useContext(PostsContext);

    //-------- 초반 게시물 5개 조회(서버사이드에서 가져오기)
    useEffect(() => {
        setPostsFromSSR(postsFromSSR);

        if (postId) {
            const exists = postsFromSSR.find((post) => post._id === postId);
            if (!exists) {
                getPosts({ 
                    getNewerPosts: true,
                    lastPostDate: postCreated,  
                })
            }
        }

    }, [postsFromSSR, setPostsFromSSR, postId, postCreated, getPosts]);

    return (
        <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
            <div className="flex flex-col text-white overflow-hidden">
                <div className="bg-slate-800">
                    <Logo />
                    <Link 
                        href="/post/new"
                        className="btn"
                    >
                        new post
                    </Link>
                    <Link href="/token-topup" className="block mt-2 text-center">
                        <FontAwesomeIcon icon={faCoins} className="text-yellow-500 mr-2" />
                        {availableTokens} tokens available
                    </Link>
                </div>
                {/* 게시물 목록 */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
                    {/* 초반 게시물 5개 */}
                    {posts.map((post) => (
                        <Link 
                            key={post._id}
                            href={`/post/${post._id}`}
                            className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                                postId === post._id ? 'bg-white/20 border-white' : ''
                            }`}
                        >
                            {post.topic}
                        </Link>
                    ))}
                    {/* 더 보기 버튼 - 추가 게시물 5개 */}
                    {!noMorePosts && (
                        <div
                            onClick={() => { 
                                getPosts({ 
                                    lastPostDate: posts[posts.length - 1].created 
                                }); 
                            }} 
                            className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
                        >
                            Load more posts
                        </div>
                    )}
                </div>
                {/* 사용자 프로필, 로그인/로그아웃 */}
                <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
                    {!!user ? (
                        <>
                            <div className="min-w-[50px]">
                                <Image 
                                    src={user.picture}
                                    alt={user.name}
                                    height={50}
                                    width={50}
                                    className="rounded-full"
                                />
                            </div>    
                            <div className="flex-1">
                                <div className="font-bold">
                                    {user.email}
                                </div>
                                <Link 
                                    href="/api/auth/logout"
                                    className="text-sm"
                                >
                                    Logout
                                </Link>
                            </div>
                        </>
                    ) : (
                        <Link href="/api/auth/login">
                            Login
                        </Link>
                    )}
                </div>
            </div>
            {children}
        </div>
    )
}