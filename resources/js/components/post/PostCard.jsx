import ReportModal from '@/components/ReportModal';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { timeAgo } from '../../lib/utils';
import { helpers } from '../utils/helpers';
import PostCardItem from './PostCardItem';

const PostCard = ({ user, posts, openModalPostId = null, onConsumedHashModal }) => {
    const { auth } = usePage().props;
    const { addOrRemoveFollow } = helpers();
    const [postList, setPostList] = useState(posts ?? []);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [openCommentsForPostId, setOpenCommentsForPostId] = useState(null);
    const [reportingPost, setReportingPost] = useState(null);

    const clearCommentOpenIntent = useCallback(() => {
        setOpenCommentsForPostId(null);
    }, []);

    useEffect(() => {
        setPostList(posts ?? []);
    }, [posts]);

    useEffect(() => {
        const handler = (event) => {
            const detail = event?.detail || {};
            const interactionId = Number(detail?.interaction_post_id);
            const reposted = Boolean(detail?.reposted);

            if (!interactionId || reposted || !auth?.user?.id) {
                return;
            }

            setPostList((prev) =>
                prev.filter((item) => {
                    if (item?.type !== 'repost') {
                        return true;
                    }

                    const isMyRepost =
                        Number(item?.interaction_post_id) === interactionId &&
                        Number(item?.user_id) === Number(auth.user.id);

                    return !isMyRepost;
                }),
            );
        };

        window.addEventListener('post-repost-toggled', handler);
        return () => window.removeEventListener('post-repost-toggled', handler);
    }, [auth?.user?.id]);

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
        return '/students/' + post?.user_id;
    };

    const handleDeletePost = useCallback(
        (postId) => {
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
                            setDeletingPostId((current) => (current === postId ? null : current));
                        },
                    });
                } catch (error) {
                    rollback?.();
                    setDeletingPostId((current) => (current === postId ? null : current));
                    reject(error);
                }
            });
        },
        [deletingPostId, handlePostRemoved],
    );

    const handleDeleteRepost = useCallback(
        (post) => {
            const originalPostId = post?.interaction_post_id;
            const cardId = post?.id;

            if (!originalPostId || !cardId) {
                return Promise.resolve(false);
            }

            if (deletingPostId === cardId) {
                return Promise.resolve(false);
            }

            const rollback = handlePostRemoved(cardId);
            setDeletingPostId(cardId);

            return new Promise((resolve, reject) => {
                try {
                    router.delete(`/posts/repost/${originalPostId}`, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            window.dispatchEvent(
                                new CustomEvent('post-repost-toggled', {
                                    detail: { interaction_post_id: originalPostId, reposted: false },
                                }),
                            );
                            resolve(true);
                        },
                        onError: (errors) => {
                            rollback?.();
                            reject(errors || new Error('Unable to remove repost.'));
                        },
                        onFinish: () => {
                            setDeletingPostId((current) => (current === cardId ? null : current));
                        },
                    });
                } catch (error) {
                    rollback?.();
                    setDeletingPostId((current) => (current === cardId ? null : current));
                    reject(error);
                }
            });
        },
        [deletingPostId, handlePostRemoved],
    );

    const handleReportPost = useCallback((post) => {
        if (!post?.id) return;
        setReportingPost(post);
    }, []);

    const handleSubmitReport = useCallback(
        (reason) =>
            new Promise((resolve, reject) => {
                const postId = reportingPost?.id;
                if (!postId) {
                    reject(new Error('Post not found.'));
                    return;
                }

                router.post(
                    `/posts/post/${postId}/report`,
                    { reason },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => resolve(),
                        onError: (errors) => {
                            const message =
                                errors?.reason ||
                                errors?.message ||
                                (typeof errors === 'object' ? Object.values(errors)[0] : null);
                            reject(new Error(message || 'Failed to submit report.'));
                        },
                    },
                );
            }),
        [reportingPost],
    );

    return (
        <>
            {postList?.map((p, index) => (
                <PostCardItem
                    key={p.id ?? index}
                    post={p}
                    authUser={auth.user}
                    user={user}
                    isDeleting={deletingPostId === p.id}
                    takeToUserProfile={takeToUserProfile}
                    timeAgo={timeAgo}
                    onDeletePost={handleDeletePost}
                    onDeleteRepost={handleDeleteRepost}
                    onReportPost={handleReportPost}
                    addOrRemoveFollow={addOrRemoveFollow}
                    openModalPostId={openModalPostId}
                    onConsumedHashModal={onConsumedHashModal}
                    openModalForComments={openCommentsForPostId === p.id}
                    onConsumedCommentOpen={clearCommentOpenIntent}
                    onCommentPress={() => setOpenCommentsForPostId(p.id)}
                />
            ))}

            <ReportModal
                open={Boolean(reportingPost)}
                onOpenChange={(open) => {
                    if (!open) setReportingPost(null);
                }}
                onSubmit={handleSubmitReport}
                postAuthorName={reportingPost?.user_name}
            />
        </>
    );
};

export default PostCard;
