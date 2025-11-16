import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { timeAgo } from '../../lib/utils';
import CommentsModal from './CommentsModal';
import LikesModal from './LikesModal';

import UndoRemove from '../UndoRemove';
import { Link, router, usePage } from '@inertiajs/react';
import { helpers } from '../utils/helpers';
import PostModal from './PostModal';
import PostCardHeader from './PostCardHeader';

const PostCard = ({ user, posts, }) => {
    const { auth } = usePage().props
    const { addOrRemoveFollow } = helpers();


    const [commentsOpenFor, setCommentsOpenFor] = useState(null);
    const [likesOpenFor, setLikesOpenFor] = useState(null);
    const [likesCountMap, setLikesCountMap] = useState({});
    const [commentsCountMap, setCommentsCountMap] = useState({});
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [undoState, setUndoState] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [undoTimer, setUndoTimer] = useState(null);
    const [postText, setPostText] = useState(null);
    const [postImage, setPostImage] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [openPostModal, setOpenPostModal] = useState(false)
    // 🩵 Toggle Like
    const toggleLike = async (postId) => {
        try {
            // Optimistic UI update
            setLikedPostIds((prev) =>
                prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
            );

            const response = await axios.post(`/posts/likes/${postId}`);
            const { liked, likes_count } = response.data;

            // Update like states from backend
            setLikedPostIds((prev) =>
                liked ? [...new Set([...prev, postId])] : prev.filter((id) => id !== postId)
            );

            setLikesCountMap((prev) => ({
                ...prev,
                [postId]: likes_count,
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // 🩵 Comment count handlers
    const handleCommentAdded = (postId) => {
        setCommentsCountMap((prev) => ({
            ...prev,
            [postId]: (prev[postId] || 0) + 1,
        }));
    };

    const handleCommentRemoved = (postId) => {
        setCommentsCountMap((prev) => ({
            ...prev,
            [postId]: Math.max((prev[postId] || 1) - 1, 0),
        }));
    };



    // 🩵 Undo delete logic
    useEffect(() => {
        return () => {
            if (undoTimer) clearTimeout(undoTimer);
        };
    }, [undoTimer]);

    const handlePostRemoved = (postId) => {
        // const newPosts = posts?.filter((p) => p?.id !== postId);
        // onPostsChange(newPosts);
    };



    const handleUndoClick = () => {
        if (undoTimer) clearTimeout(undoTimer);
        setUndoState(false);
        setPendingDeleteId(null);
    };

    // 🩵 Open/close post details dropdown
    const handleOpenDetails = (post) => {
        setOpenDetails(post?.id);
        setPostText(post?.description);
        setPostImage(post?.image);
    };



    const takeToUserProfile = (post) => {
        if (auth.user.role.includes('admin')) {
            return '/admin/users/' + post?.user_id
        }
        return '/student/' + post?.user_id
    }
    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
            {posts?.map((p, index) => {
                const isLiked = likedPostIds.includes(p?.id);
                const likeCount = likesCountMap[p?.id] ?? p?.likes_count;
                const commentCount = commentsCountMap[p?.id] ?? p?.comments_count;
                const hasMore = p?.description?.length > 120;
                const isExpanded = expandedDescriptions[p?.id];
                const displayText = hasMore && !isExpanded
                    ? p.description.slice(0, 200) + '...'
                    : p.description;


                return (
                    <div key={index} className="bg-white dark:bg-dark rounded-lg shadow mb-4">
                        {/* Post Header */}
                        <PostCardHeader p={p} user={auth.user} postText={postText} postImage={postImage} onPostTextChange={setPostText} onPostImageChange={setPostImage} takeUserProfile={takeToUserProfile} timeAgo={timeAgo} />

                        {/* Post Content */}
                        <div className="mt-3 px-4">
                            {p?.description && (
                                <>
                                    <p className="text-gray-800 dark:text-light w-full text-sm whitespace-pre-wrap break-words overflow-hidden">
                                        {displayText}
                                    </p>
                                    {hasMore && (
                                        <button
                                            onClick={() => toggleDescription(p.id)}
                                            className="dark:text-light/50 text-dark/50  text-sm mt-1 hover:underline"
                                        >
                                            {isExpanded ? 'See less' : 'See more'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Post Image */}
                        {p?.images?.length > 0 && (
                            <div className="relative w-full px-1 aspect-video mt-3 flex flex-col">

                                {/* Top big image */}
                                <img
                                    src={`/storage/img/posts/${p.images[0]}`}
                                    alt=""
                                    className="w-full h-[70%] object-cover"
                                />

                                {/* Bottom small images */}
                                {p.images.length > 1 && (
                                    <div className="h-[30%] w-full flex">
                                        {p.images.slice(1, 5).map((img, i) => (
                                            <div key={i} className="relative w-1/4 h-full">
                                                <img
                                                    src={`/storage/img/posts/${img}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* If more than 5 images → show +X overlay */}
                                                {i === 3 && p.images.length > 5 && (
                                                    <div onClick={() => setOpenPostModal(true)} className="absolute cursor-pointer inset-0 bg-black/60 text-white text-xl flex items-center justify-center">
                                                        +{p.images.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {openPostModal && <PostModal isOpen={openPostModal} onClose={() => setOpenPostModal(false)} post={p} displayText={displayText} hasMore={hasMore} expandedDescriptions={expandedDescriptions} onExpandedDescriptionsChange={setExpandedDescriptions} timeAgo={timeAgo} user={auth.user} addOrRemovFollow={addOrRemoveFollow} />}

                            </div>
                        )}

                        {/* post footer */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-dark_gray/70 dark:bg-dark">
                            <div
                                className="text-xs text-gray-600 hover:underline cursor-pointer dark:text-gray-400"
                                onClick={() => setLikesOpenFor(p?.id)}
                            >
                                {likeCount} Likes
                            </div>

                            <div
                                onClick={() => setCommentsOpenFor(p?.id)}
                                className="text-xs text-gray-600 hover:underline cursor-pointer dark:text-gray-400"
                            >
                                {commentCount} Comments
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="px-2 py-2 flex justify-around items-center rounded-b-lg shadow-sm bg-light dark:bg-dark ">
                            {/* Like Button */}
                            <button
                                onClick={() => toggleLike(p?.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${isLiked
                                    ? 'text-alpha'
                                    : 'text-beta dark:text-light hover:text-alpha'
                                    }`}
                            >
                                <svg
                                    className={`w-5 h-5 ${isLiked ? 'text-alpha' : 'text-beta dark:text-light'
                                        }`}
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
                                <span className="font-semibold text-sm">
                                    {isLiked ? 'Liked' : 'Like'}
                                </span>
                            </button>

                            {/* Comment Button */}
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

            {/* Undo popup */}
            {undoState && <UndoRemove state={undoState} onUndo={handleUndoClick} />}

            {/* Comments modal */}
            {commentsOpenFor && (
                <CommentsModal
                    postId={commentsOpenFor}
                    open={!!commentsOpenFor}
                    onClose={() => setCommentsOpenFor(null)}
                    currentUser={user}
                    onCommentAdded={() => handleCommentAdded(commentsOpenFor)}
                    onCommentRemoved={() => handleCommentRemoved(commentsOpenFor)}
                    takeToUserProfile={takeToUserProfile}
                />
            )}

            {/* Likes modal */}
            <LikesModal
                postId={likesOpenFor}
                open={!!likesOpenFor}
                onClose={() => setLikesOpenFor(null)}
                takeToUserProfile={takeToUserProfile}
            />
        </>
    );
};

export default PostCard;
