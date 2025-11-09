import React, { useState, useEffect } from 'react';
import { X, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';  // Assuming Avatar component is correctly imported
import axios from 'axios';
import { timeAgo } from '../lib/utils';
import PostMenuDropDown from './PostMenuDropDown'; // Importing PostMenuDropDown
import EditPost from './EditPost'; // Importing EditPost modal component
import { router } from '@inertiajs/react'; // Assuming Inertia.js is being used

const PostCard = ({ user, posts }) => {
    const [commentsOpenFor, setCommentsOpenFor] = useState(null);
    const [likesOpenFor, setLikesOpenFor] = useState(null);
    const [likesCountMap, setLikesCountMap] = useState({});
    const [commentsCountMap, setCommentsCountMap] = useState({});
    const [commentsPostIds, setCommentsPostIds] = useState({});
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [openDetails, setOpenDetails] = useState(null);
    const [allPosts, setAllPosts] = useState(posts);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
    const [selectedPost, setSelectedPost] = useState(null); // The post currently being edited

    useEffect(() => {
        const likedIds = [];
        const commentIds = [];
        const likesCounts = {};
        const commentsCounts = {};
        allPosts?.forEach((post) => {
            if (post?.liked_by_current_user) likedIds.push(post?.id);
            likesCounts[post?.id] = post?.likes_count;
            if (post?.commented_by_current_user) commentIds.push(post?.id);
            commentsCounts[post?.id] = post?.comments_count;
        });
        setLikedPostIds(likedIds);
        setLikesCountMap(likesCounts);
        setCommentsPostIds(commentIds);
        setCommentsCountMap(commentsCounts);
    }, [posts]);

    const handleEditPost = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true); // Open the modal
    };

    const handleUpdatePost = (updatedPost) => {
        const updatedPosts = allPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
        );
        setAllPosts(updatedPosts); // Update the posts state with the new post data
        setIsModalOpen(false); // Close the modal
    };

    const toggleLike = async (postId) => {
        try {
            setLikedPostIds((prev) =>
                prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
            );

            const response = await axios.post(`/posts/likes/${postId}`);
            const { liked, likes_count } = response.data;

            setLikedPostIds((prev) => {
                if (liked) {
                    return [...new Set([...prev, postId])];
                } else {
                    return prev.filter((id) => id !== postId);
                }
            });

            setLikesCountMap((prev) => ({
                ...prev,
                [postId]: likes_count,
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await router.delete(`/posts/post/${postId}`);
            const newAllPosts = allPosts.filter(p => p.id !== postId);
            setAllPosts(newAllPosts);
        } catch (error) {
            console.log('Failed to delete post:', error);
        }
    };

    const handleOpenDetails = (postId) => {
        setOpenDetails(openDetails === postId ? null : postId); // Toggle post details
    };

    return (
        <>
            {allPosts.map((p, index) => {
                const isLiked = likedPostIds.includes(p?.id);
                const likeCount = likesCountMap[p?.id] !== undefined ? likesCountMap[p?.id] : p?.likes_count;
                return (
                    <div key={index} className="bg-white dark:bg-beta rounded-lg shadow">
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        className="w-12 h-12"
                                        image={user?.image}
                                        name={user?.name}
                                        lastActivity={user?.last_online || null}
                                        onlineCircleClass="hidden"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-light">
                                                {user?.name}
                                            </h3>
                                            <span className="text-gray-500 dark:text-alpha text-xs">• Following</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{user?.status}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{timeAgo(p?.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions (More, Edit, Delete) */}
                                <div className="flex relative items-center gap-2">
                                    <button
                                        className="text-gray-600 dark:text-gray-400 dark:hover:text-alpha cursor-pointer hover:text-dark p-2 rounded"
                                        onClick={() => handleOpenDetails(p.id)} // Toggle post details dropdown
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>

                                    {/* Conditionally render the dropdown menu */}
                                    {openDetails === p.id && (
                                        <PostMenuDropDown
                                            post={p}
                                            handleDelete={() => handleDeletePost(p.id)}
                                            handleEdittePost={() => handleEditPost(p)} // Open edit modal
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mt-3">
                            <p className="text-gray-800 dark:text-light text-sm leading-relaxed px-4">{p?.description}</p>
                        </div>

                        {/* Media Container (Image/Video) */}
                        <div className="relative bg-black aspect-video mt-3">
                            <img src={`/storage${p?.image}`} alt="Post media" className="w-full h-full object-cover" />
                        </div>

                        {/* Engagement Stats */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-dark_gray">
                            <div className="text-xs text-gray-600 hover:underline cursor-pointer dark:text-gray-400">
                                <span
                                    onClick={() => setLikesOpenFor(p?.id)}
                                    className="text-xs text-gray-600 dark:text-gray-400"
                                >
                                    {likeCount} Likes
                                </span>
                            </div>

                            <div
                                onClick={() => setCommentsOpenFor(p?.id)}
                                className="text-xs text-gray-600 hover:underline cursor-pointer dark:text-gray-400"
                            >
                                <span>{p?.comments_count} comments</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-2 py-2 flex justify-around items-center rounded-lg shadow-sm bg-light dark:bg-dark_gray dark:border-dark">
                            <button
                                onClick={() => toggleLike(p?.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-alpha`}
                                aria-pressed={isLiked}
                            >
                                <svg
                                    className={`w-5 h-5 ${isLiked ? 'text-alpha' : 'text-beta dark:text-light'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                    />
                                </svg>
                                <span className={`${isLiked ? 'text-alpha' : 'text-beta dark:text-light'} font-semibold text-sm`}>
                                    {isLiked ? "Liked" : "Like"}
                                </span>
                            </button>

                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-beta"
                                onClick={() => setCommentsOpenFor(p?.id)}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                <span className="text-sm font-semibold">Comment</span>
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* EditPost Modal */}
            {isModalOpen && selectedPost && (
                <EditPost
                    post={selectedPost}
                    user={user}
                    onOpenChange={setIsModalOpen}
                    onConfirm={handleUpdatePost}
                />
            )}
        </>
    );
};

export default PostCard;
