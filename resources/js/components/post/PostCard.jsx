import React, { useState, useEffect, useRef } from 'react';
import { X, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import axios from 'axios';
import { timeAgo } from '../../lib/utils';
import CommentsModal from './CommentsModal';
import LikesModal from './LikesModal';
import PostMenuDropDown from './PostMenuDropDown';
import UndoRemove from '../UndoRemove';
import { router } from '@inertiajs/react';

const PostCard = ({ user, posts = [], onPostsChange }) => {
    const [commentsOpenFor, setCommentsOpenFor] = useState(null);
    const [likesOpenFor, setLikesOpenFor] = useState(null);
    const [likesCountMap, setLikesCountMap] = useState({});
    const [commentsCountMap, setCommentsCountMap] = useState({});
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [openDetails, setOpenDetails] = useState(null);
    const [openDeletePost, setOpenDeletePost] = useState(false);
    const [openEditPost, setOpenEditPost] = useState(false);
    const [undoState, setUndoState] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [undoTimer, setUndoTimer] = useState(null);
    const [postText, setPostText] = useState(null);
    const [postImage, setPostImage] = useState(null);

    const dropdownRef = useRef(null);

    // 🩵 Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDetails(null);
            }
        };

        if (openDetails) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDetails]);

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

    // 🩵 Delete Post
    const handleDeletePost = (postId) => {
        try {
            router.delete(`/posts/post/${postId}`, {
                onSuccess: () => {
                    const newPosts = posts?.filter((p) => p?.id !== postId);
                    onPostsChange(newPosts);
                    setOpenDetails(null); // Close dropdown after delete
                },
            });
        } catch (error) {
            //console.log('Failed to delete post:', error);
        }
    };

    // 🩵 Undo delete logic
    useEffect(() => {
        return () => {
            if (undoTimer) clearTimeout(undoTimer);
        };
    }, [undoTimer]);

    const handlePostRemoved = (postId) => {
        const newPosts = posts?.filter((p) => p?.id !== postId);
        onPostsChange(newPosts);
    };

    const handleRemoveClick = (postId) => {
        setPendingDeleteId(postId);
        setUndoState(true);

        const timer = setTimeout(() => {
            handlePostRemoved(postId);
            setUndoState(false);
            setPendingDeleteId(null);
        }, 5000);

        setUndoTimer(timer);
    };

    const handleUndoClick = () => {
        if (undoTimer) clearTimeout(undoTimer);
        setUndoState(false);
        setPendingDeleteId(null);
    };

    // 🩵 Open/close post details dropdown
    const handleOpenDetails = (post, e) => {
        e.stopPropagation(); // Prevent event bubbling
        setOpenDetails((prev) => (prev === post?.id ? null : post?.id));
        setPostText(post?.description);
        setPostImage(post?.image);
    };

    // 🩵 Edit post
    const handleEdit = (post) => {
        try {
            router.post(
                `/posts/post/${post?.id}`,
                {
                    description: postText,
                    image: postImage,
                },
                {
                    onSuccess: (page) => {
                        setOpenEditPost(false);
                        setOpenDetails(null);

                        // Find updated post from Inertia props
                        const editedPost = page.props.posts?.find((p) => p?.id === post?.id);
                        if (editedPost) {
                            onPostsChange((prevPosts) =>
                                prevPosts?.map((p) => (p?.id === editedPost?.id ? editedPost : p))
                            );
                        }
                    },
                }
            );
        } catch (error) {
            //console.log('Failed to update:', error);
        }
    };

    // 🩵 UI Render
    return (
        <>
            {posts?.map((p, index) => {
                const isLiked = likedPostIds.includes(p?.id);
                const likeCount = likesCountMap[p?.id] ?? p?.likes_count;
                const commentCount = commentsCountMap[p?.id] ?? p?.comments_count;

                return (
                    <div key={index} className="bg-white dark:bg-beta rounded-lg shadow mb-4">
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        className="w-12 h-12 overflow-hidden relative z-50"
                                        image={p?.user_image}
                                        name={p?.user_name}
                                        lastActivity={p?.user_last_online || null}
                                        onlineCircleClass="hidden"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-light">
                                                {p?.user_name}
                                            </h3>
                                            <span className="text-gray-500 dark:text-alpha text-xs">
                                                • Following
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {p?.user_status}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{timeAgo(p?.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2" ref={openDetails === p?.id ? dropdownRef : null}>
                                    {user?.id === p?.user_id && (
                                        <button
                                            className="text-gray-600 relative dark:text-gray-400 dark:hover:text-alpha cursor-pointer hover:text-dark p-2 rounded"
                                            onClick={(e) => handleOpenDetails(p, e)}
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                            {openDetails === p?.id && (
                                                <PostMenuDropDown
                                                    user={user}
                                                    openDelete={openDeletePost}
                                                    openChangeDelete={setOpenDeletePost}
                                                    openEditPost={openEditPost}
                                                    openChangeEdit={setOpenEditPost}
                                                    post={p}
                                                    handleDelete={() => handleDeletePost(p?.id)}
                                                    postText={postText}
                                                    onPostTextChange={setPostText}
                                                    onPostImageChange={setPostImage}
                                                    handleEditePost={() => handleEdit(p)}
                                                />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mt-3 px-4">
                            <p className="text-gray-800 dark:text-light text-sm leading-relaxed">
                                {p?.description}
                            </p>
                        </div>

                        {/* Post Image */}
                        {p?.image && (
                            <div className="relative bg-black aspect-video mt-3">
                                <img
                                    src={`/storage/img/posts/${p?.image}`}
                                    alt="Post media"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Stats */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-dark_gray">
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
                        <div className="px-2 py-2 flex justify-around items-center rounded-lg shadow-sm bg-light dark:bg-dark_gray dark:border-dark">
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
                />
            )}

            {/* Likes modal */}
            <LikesModal
                postId={likesOpenFor}
                open={!!likesOpenFor}
                onClose={() => setLikesOpenFor(null)}
            />
        </>
    );
};

export default PostCard;