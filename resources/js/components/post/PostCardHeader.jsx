import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Avatar } from '@/components/ui/avatar';
import PostMenuDropDown from './PostMenuDropDown';
import { MoreHorizontal } from 'lucide-react';

const PostCardHeader = ({ post, user, takeUserProfile, timeAgo }) => {
    const [openDetails, setOpenDetails] = useState(null);
    const [openDeletePost, setOpenDeletePost] = useState(false);
    const [openEditPost, setOpenEditPost] = useState(false);
    //! Delete Post
    const handleDeletePost = (postId) => {
        try {
            router.delete(`/posts/post/${postId}`, {
                onSuccess: () => {
                    // const newPosts = posts?.filter((p) => p?.id !== postId);
                    // onPostsChange(newPosts);
                },
            });
        } catch (error) {
            //console.log('Failed to delete post:', error);
        }
    };
    //! open dropdonw  
    const handleOpenDetails = (post) => {
        setOpenDetails(post?.id);
    };
    return (
        <>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={takeUserProfile(post)} className="font-semibold text-sm text-gray-900 dark:text-light">
                            <Avatar
                                className="w-12 h-12 overflow-hidden relative z-50"
                                image={post?.user_image}
                                name={post?.user_name}
                                lastActivity={post?.user_last_online || null}
                                onlineCircleClass="hidden"
                            />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link href={takeUserProfile(post)} className="font-semibold text-sm text-gray-900 dark:text-light">
                                    {post?.user_name}
                                </Link>
                                {user?.id != post?.user_id &&
                                    <span onClick={() => addOrRemoveFollow(post?.user_id, post?.is_following)} className="text-gray-500 dark:text-alpha text-xs cursor-pointer">
                                        • {post?.is_following ? 'Unfollow' : 'Follow'}
                                    </span>
                                }
                            </div>
                            {/* <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {post?.user_status}
                                        </p> */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{timeAgo(post?.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {user?.id === post?.user_id && (
                            <button
                                className="text-gray-600 relative dark:text-gray-400 dark:hover:text-alpha cursor-pointer hover:text-dark p-2 rounded"
                                onClick={() => handleOpenDetails(post)}
                            >
                                <MoreHorizontal className="w-5 h-5" />
                                {openDetails === post?.id && (
                                    <PostMenuDropDown
                                        user={user}
                                        openDelete={openDeletePost}
                                        openChangeDelete={setOpenDeletePost}
                                        openEditPost={openEditPost}
                                        openChangeEdit={(state) => {
                                            setOpenEditPost(state);
                                            if (!state) {
                                                setOpenDetails(null);
                                            }
                                        }}
                                        post={post}
                                        handleDelete={() => handleDeletePost(post?.id)}
                                    />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostCardHeader;