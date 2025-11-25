import React, { useState, useEffect, useCallback } from 'react';
import { timeAgo } from '../../lib/utils';
import { router, usePage } from '@inertiajs/react';
import { helpers } from '../utils/helpers';
import PostCardHeader from './PostCardHeader';
import PostCardMainContent from './PostCardMainContent';
import PostCardFooter from './PostCardFooter';

const PostCard = ({ user, posts }) => {
    const { auth } = usePage().props
    const { addOrRemoveFollow } = helpers();
    const [postList, setPostList] = useState(posts ?? []);
    const [deletingPostId, setDeletingPostId] = useState(null);

    useEffect(() => {
        setPostList(posts ?? []);
    }, [posts]);

    const handlePostRemoved = useCallback((postId) => {
        if (!postId) {
            return null;
        }

        let snapshot = null;

        setPostList((prev) => {
            snapshot = prev;
            return prev.filter((post) => post.id !== postId);
        });

        return () => {
            if (!snapshot) {
                return;
            }

            setPostList((current) => {
                if (current.some((post) => post.id === postId)) {
                    return current;
                }

                return snapshot;
            });
        };
    }, []);

    const takeToUserProfile = (post) => {
        if (auth.user.role.includes('admin') || auth.user.role.includes('moderateur')) {
            return '/admin/users/' + post?.user_id
        }
        return '/student/' + post?.user_id
    }

    const handleDeletePost = useCallback((postId) => {
        if (!postId) {
            return Promise.resolve(false);
        }

        if (deletingPostId === postId) {
            return Promise.resolve(false);
        }

        const rollback = handlePostRemoved(postId);
        setDeletingPostId(postId);

        return new Promise((resolve, reject) => {
            try {
                router.delete(`/posts/post/${postId}`, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        resolve(true);
                    },
                    onError: (errors) => {
                        rollback?.();
                        reject(errors || new Error('Unable to delete post.'));
                    },
                    onFinish: () => {
                        setDeletingPostId((current) => current === postId ? null : current);
                    },
                });
            } catch (error) {
                rollback?.();
                setDeletingPostId((current) => current === postId ? null : current);
                reject(error);
            }
        });
    }, [deletingPostId, handlePostRemoved]);

    return (
        <>
            {postList?.map((p, index) => {
                const isDeleting = deletingPostId === p.id;
                return (
                    <div key={p.id ?? index} className="relative bg-white dark:bg-dark_gray rounded-lg shadow mb-4 overflow-hidden">
                        {isDeleting && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-dark/70 text-dark dark:text-light text-sm font-semibold">
                                Deleting...
                            </div>
                        )}
                        {/* Post Header */}
                        <PostCardHeader
                            post={p}
                            user={auth.user}
                            takeUserProfile={takeToUserProfile}
                            timeAgo={timeAgo}
                            onDeletePost={handleDeletePost}
                            isDeleting={isDeleting}
                        />

                        {/* Post Content */}
                        <PostCardMainContent post={p} user={auth.user} addOrRemoveFollow={addOrRemoveFollow} timeAgo={timeAgo} takeToUserProfile={takeToUserProfile} />

                        {/* post footer */}
                        <PostCardFooter post={p} user={auth.user} takeToUserProfile={takeToUserProfile} />
                    </div>
                );
            })}
        </>
    );
};

export default PostCard;
