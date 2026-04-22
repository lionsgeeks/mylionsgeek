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
                        lastActivity={post?.user_last_online || null}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                <div className={shellClass}>
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
                    <div
                        className="fixed inset-0 z-[70] bg-black/80"
                        onClick={() => setOpenCommentLikes(false)}
                        role="presentation"
                    />
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-light shadow-2xl dark:border-white/10 dark:bg-dark_gray">
                            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 dark:border-white/10">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-beta dark:text-light">Liked by</p>
                                    <p className="truncate text-xs text-muted-foreground dark:text-light/60">
                                        {activeCommentForLikes?.likes_count ? `${activeCommentForLikes.likes_count} likes` : '0 likes'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpenCommentLikes(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/60 hover:text-beta dark:text-light/70 dark:hover:bg-white/10 dark:hover:text-light"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-2">
                                {commentLikesLoading ? (
                                    <div className="p-6 text-center">
                                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-alpha/30 border-t-alpha" />
                                        <p className="mt-3 text-sm text-alpha">Loading likes...</p>
                                    </div>
                                ) : commentLikesError ? (
                                    <div className="p-6 text-center">
                                        <p className="text-sm font-semibold text-error">Failed to load likes.</p>
                                        <p className="mt-1 text-xs text-muted-foreground dark:text-light/60">
                                            Please try again.
                                        </p>
                                    </div>
                                ) : commentLikes.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-sm text-muted-foreground dark:text-light/60">No likes yet.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-border/70 dark:divide-white/10">
                                        {commentLikes.map((like) => {
                                            const profileHref = like?.user_id != null ? `/students/${like.user_id}` : '#';
                                            return (
                                                <li key={like.id ?? `${like.user_id}-${like.created_at ?? ''}`} className="px-2 py-2">
                                                    <Link
                                                        href={profileHref}
                                                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-muted/60 dark:hover:bg-white/10"
                                                    >
                                                        <Avatar
                                                            className="h-10 w-10 overflow-hidden"
                                                            image={like?.user_image}
                                                            name={like?.user_name}
                                                            onlineCircleClass="hidden"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-beta dark:text-light">
                                                                {like?.user_name || 'User'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
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
