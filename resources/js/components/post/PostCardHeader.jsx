import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Avatar } from '@/components/ui/avatar';
import PostMenuDropDown from './PostMenuDropDown';
import { MoreHorizontal } from 'lucide-react';
import { helpers } from '../utils/helpers';

const PostCardHeader = ({ post, user, takeUserProfile, timeAgo, onDeletePost, isDeleting = false }) => {
    const { addOrRemoveFollow } = helpers();
    const [openDetails, setOpenDetails] = useState(null);
    const [openDeletePost, setOpenDeletePost] = useState(false);
    const [openEditPost, setOpenEditPost] = useState(false);
    const actionAreaRef = useRef(null);

    //! Delete Post
    const handleDeletePost = () => {
        if (!post?.id || !onDeletePost || isDeleting) {
            return Promise.resolve(false);
        }

        return onDeletePost(post.id)
            .then((result) => {
                setOpenDetails(null);
                setOpenDeletePost(false);
                return result;
            });
    };
    //! open dropdonw  
    const handleOpenDetails = (post) => {
        setOpenDetails((current) => (current === post?.id ? null : post?.id));
    };

    useEffect(() => {
        if (!openDetails) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!actionAreaRef.current) {
                return;
            }

            if (!actionAreaRef.current.contains(event.target)) {
                setOpenDetails(null);
                setOpenDeletePost(false);
                setOpenEditPost(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpenDetails(null);
                setOpenDeletePost(false);
                setOpenEditPost(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [openDetails]);
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
                    <div className="flex items-center gap-2" ref={actionAreaRef}>
                        {user?.id === post?.user_id && (
                            <button
                                className={`text-gray-600 relative dark:text-gray-400 dark:hover:text-alpha cursor-pointer hover:text-dark p-2 rounded ${isDeleting ? 'opacity-60 pointer-events-none' : ''}`}
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
                                        handleDelete={handleDeletePost}
                                        isDeleting={isDeleting}
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