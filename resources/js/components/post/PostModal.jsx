import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { helpers } from '../utils/helpers';
import PostCardFooter from './PostCardFooter';
import PostCommentsSection from './PostCommentsSection';
import PostImageCarousel from './PostImageCarousel';
import { renderPostText } from './utils/renderPostText';

const PostModal = ({
    isOpen,
    onOpenChange,
    post,
    isExpanded,
    hasMore,
    displayText,
    timeAgo,
    user,
    addOrRemovFollow,
    toggleDescription,
    takeToUserProfile,
    scrollToCommentsOnOpen,
    onScrollToCommentsConsumed,
}) => {
    const { stopScrolling } = helpers();
    const hasImages = Array.isArray(post?.images) && post.images.length > 0;
    const [commentCountDelta, setCommentCountDelta] = useState(0);
    const [openCommentLikes, setOpenCommentLikes] = useState(false);
    const [commentLikesLoading, setCommentLikesLoading] = useState(false);
    const [commentLikesError, setCommentLikesError] = useState(null);
    const [activeCommentForLikes, setActiveCommentForLikes] = useState(null);
    const [commentLikes, setCommentLikes] = useState([]);

    const postForFooter = useMemo(
        () => ({
            ...post,
            comments_count: (post?.comments_count ?? 0) + commentCountDelta,
        }),
        [post, commentCountDelta],
    );

    useEffect(() => {
        setCommentCountDelta(0);
    }, [post?.id]);

    useEffect(() => {
        if (!isOpen) {
            setOpenCommentLikes(false);
            setCommentLikesLoading(false);
            setCommentLikesError(null);
            setActiveCommentForLikes(null);
            setCommentLikes([]);
        }
    }, [isOpen]);

    useEffect(() => {
        stopScrolling(true);
        return () => {
            stopScrolling(false);
        };
    });

    useEffect(() => {
        if (!scrollToCommentsOnOpen) {
            return;
        }
        const id = window.setTimeout(() => {
            document.getElementById('post-comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            onScrollToCommentsConsumed?.();
        }, 200);
        return () => window.clearTimeout(id);
    }, [scrollToCommentsOnOpen, onScrollToCommentsConsumed]);

    const changeOpen = (e) => {
        e.stopPropagation();
        onOpenChange(false);
    };

    const scrollCommentsIntoView = () => {
        document.getElementById('post-comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const handleCommentAddedFromSection = () => {
        setCommentCountDelta((d) => d + 1);
    };

    const handleCommentRemovedFromSection = () => {
        setCommentCountDelta((d) => Math.max(0, d - 1));
    };

    const openCommentLikesModal = async (comment) => {
        const commentId = Number(comment?.id);
        if (!commentId) return;

        setOpenCommentLikes(true);
        setActiveCommentForLikes(comment);
        setCommentLikes([]);
        setCommentLikesError(null);
        setCommentLikesLoading(true);

        try {
            const res = await axios.get(`/posts/comments/${commentId}/likes`);
            const likes = Array.isArray(res?.data?.likes) ? res.data.likes : [];
            setCommentLikes(likes);
        } catch (error) {
            setCommentLikesError(error);
        } finally {
            setCommentLikesLoading(false);
        }
    };

    const commentsSection = post?.id ? (
        <PostCommentsSection
            postId={post.id}
            enabled={isOpen}
            embedded
            variant="facebook"
            takeToUserProfile={takeToUserProfile}
            onCommentAdded={handleCommentAddedFromSection}
            onCommentRemoved={handleCommentRemovedFromSection}
            onOpenCommentLikes={openCommentLikesModal}
        />
    ) : null;

    const footer = (
        <PostCardFooter
            post={postForFooter}
            user={user}
            takeToUserProfile={takeToUserProfile}
            PostModal={hasImages}
            variant="facebook"
            onCommentPress={scrollCommentsIntoView}
        />
    );

    const profileHref = post?.user_id != null ? `/students/${post.user_id}` : '#';

    const header = (
        <div className="flex-shrink-0 border-b border-border/70 bg-light px-4 py-3 dark:border-white/10 dark:bg-dark_gray">
            <div className="flex items-start gap-3">
                <Link
                    href={profileHref}
                    className="shrink-0 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-light transition hover:ring-alpha/40 dark:ring-offset-dark_gray"
                >
                    <Avatar
                        className="relative z-10 h-10 w-10 overflow-hidden"
                        image={post?.user_image}
                        name={post?.user_name}
                        lastActivity={post?.user_last_login ?? post?.user_last_online ?? post?.user_last_activity ?? null}
                        onlineCircleClass="hidden"
                    />
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <Link href={profileHref} className="truncate text-[15px] font-semibold text-beta hover:underline dark:text-light">
                            {post?.user_name}
                        </Link>
                        {user?.id != post.user_id && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={() => addOrRemovFollow(post?.user_id, post?.is_following)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        addOrRemovFollow(post?.user_id, post?.is_following);
                                    }
                                }}
                                className="cursor-pointer text-xs font-medium text-alpha hover:underline"
                            >
                                {post?.is_following ? 'Following' : 'Follow'}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground dark:text-light/55">{timeAgo(post?.created_at)}</p>
                </div>
            </div>
        </div>
    );

    const descriptionBlock = (
        <div className="px-4 py-2">
            <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground dark:text-light/95">
                {renderPostText({ text: displayText, post })}
            </p>
            {hasMore && (
                <button
                    type="button"
                    onClick={() => toggleDescription(post?.id)}
                    className="mt-1 text-sm font-medium text-muted-foreground hover:text-alpha dark:text-light/60 dark:hover:text-alpha"
                >
                    {isExpanded ? 'See less' : 'See more'}
                </button>
            )}
        </div>
    );

    /** Facebook-style: dark stage + light sidebar, or centered card for text-only */
    const shellClass = hasImages
        ? 'relative flex h-[100dvh] w-full max-w-[1100px] flex-col overflow-hidden rounded-none border border-white/10 bg-light shadow-2xl dark:border-white/10 dark:bg-dark_gray sm:h-[min(92vh,880px)] sm:max-h-[92vh] sm:rounded-xl lg:flex-row'
        : 'relative flex h-[100dvh] w-full max-w-[500px] flex-col overflow-hidden rounded-none border border-border/80 bg-light shadow-2xl dark:border-white/10 dark:bg-dark_gray sm:h-[min(92vh,800px)] sm:max-h-[92vh] sm:rounded-xl';

    const closeBtnClass = hasImages
        ? 'absolute z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:bg-white/25'
        : 'absolute z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-light text-beta shadow-md ring-1 ring-border/80 transition hover:bg-muted/80 dark:bg-dark_gray dark:text-light dark:ring-white/10';

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/80" onClick={(e) => changeOpen(e)} role="presentation" />
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
                onMouseDown={(e) => {
                    // shadcn-like: clicking the overlay area closes; clicking inside doesn't.
                    if (e.target === e.currentTarget) {
                        onOpenChange(false);
                    }
                }}
                role="presentation"
            >
                <div className={shellClass} onMouseDown={(e) => e.stopPropagation()} role="presentation">
                    {/* Close — top-left over media (FB-style), top-right on text-only */}
                    <button
                        type="button"
                        onClick={(e) => changeOpen(e)}
                        className={`${closeBtnClass} ${hasImages ? 'top-3 left-3 sm:top-4 sm:left-4' : 'top-3 right-3'}`}
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" strokeWidth={2.2} />
                    </button>

                    {hasImages ? (
                        <>
                            <div className="relative flex min-h-[38vh] w-full flex-[1.1] items-center justify-center bg-black lg:min-h-0">
                                <div className="flex h-full w-full items-center justify-center p-1 sm:p-2">
                                    <PostImageCarousel images={post?.images} />
                                </div>
                            </div>

                            <div className="flex h-full min-h-0 w-full flex-col border-t border-white/10 bg-light lg:w-[min(100%,380px)] lg:flex-shrink-0 lg:border-t-0 lg:border-l xl:w-[400px] dark:border-white/10 dark:bg-dark_gray">
                                {header}
                                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                                    {descriptionBlock}
                                    {commentsSection}
                                </div>
                                <div className="flex-shrink-0 border-t border-border/80 bg-muted/20 dark:border-white/10 dark:bg-dark/80">
                                    {footer}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {header}
                            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                                {descriptionBlock}
                                {commentsSection}
                            </div>
                            <div className="flex-shrink-0 border-t border-border/80 bg-muted/20 dark:border-white/10 dark:bg-dark/80">{footer}</div>
                        </>
                    )}
                </div>
            </div>

            {openCommentLikes && (
                <>
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setOpenCommentLikes(false)}
                            role="presentation"
                        />

                        {/* Modal */}
                        <div className="relative z-10 mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-alpha/30 bg-light shadow-2xl transition-all duration-300 dark:bg-dark_gray">
                            {/* Header */}
                            <div className="relative border-b border-alpha/30 bg-gradient-to-r from-alpha/10 to-alpha/5 px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <h2 className="text-lg font-semibold text-beta dark:text-alpha">Liked by</h2>
                                </div>
                                <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {commentLikesLoading ? 'Loading...' : `${commentLikes.length} people`}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setOpenCommentLikes(false)}
                                    className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-alpha/10 hover:text-dark dark:text-gray-400"
                                    aria-label="Close likes"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Likes List */}
                            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-6 py-4">
                                {commentLikesLoading ? (
                                    <p className="py-6 text-center text-gray-500 dark:text-gray-400">Loading likes...</p>
                                ) : commentLikesError ? (
                                    <p className="py-6 text-center text-gray-500 dark:text-gray-400">Error loading likes</p>
                                ) : commentLikes.length === 0 ? (
                                    <p className="py-6 text-center text-gray-500 dark:text-gray-400">No likes yet</p>
                                ) : (
                                    commentLikes.map((like) => {
                                        const profileHref =
                                            typeof takeToUserProfile === 'function'
                                                ? takeToUserProfile(like)
                                                : like?.user_id != null
                                                  ? `/students/${like.user_id}`
                                                  : '#';

                                        return (
                                            <div
                                                key={like.id ?? `${like.user_id}-${like.created_at ?? ''}`}
                                                className="flex items-center gap-3 rounded-2xl border border-alpha/10 bg-gray-50 p-3 transition duration-200 hover:border-alpha/30 hover:shadow-md dark:bg-beta"
                                            >
                                                <Link
                                                    href={profileHref}
                                                    className="hover:bg-light_gray flex w-full items-center gap-3 rounded-lg p-2 transition-colors"
                                                >
                                                    <Avatar
                                                        className="h-11 w-11 flex-shrink-0 ring-2 ring-alpha/30"
                                                        image={like?.user_image}
                                                        name={like?.user_name}
                                                        width="w-11"
                                                        height="h-11"
                                                    />

                                                    <div className="flex flex-1 items-start justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="max-w-[150px] truncate font-medium text-dark dark:text-light">
                                                                {like?.user_name || 'User'}
                                                            </span>
                                                        </div>

                                                        <span className="text-xs whitespace-nowrap text-gray-400">
                                                            {like?.created_at ? timeAgo(like.created_at) : ''}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PostModal;
