import { useEffect, useState } from 'react';
import { helpers } from '../utils/helpers';
import PostModal from './PostModal';
import { renderPostText } from './utils/renderPostText';
import { Link } from '@inertiajs/react';
import { Avatar } from '@/components/ui/avatar';

const PostCardMainContent = ({
    post,
    user,
    addOrRemoveFollow,
    timeAgo,
    takeToUserProfile,
    openModalPostId,
    onConsumedHashModal,
    openModalForComments,
    onConsumedCommentOpen,
}) => {
    const [openPostModal, setOpenPostModal] = useState(false);
    const [scrollToCommentsAfterOpen, setScrollToCommentsAfterOpen] = useState(false);
    const { resolvePostImageUrl } = helpers();
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const originalPost = post?.repost_of ?? null;
    const modalPost = originalPost ?? post;

    const toggleDescription = (id) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const hasMore = post?.description?.length > 120;
    const isExpanded = expandedDescriptions[post?.id];
    const displayText = hasMore && !isExpanded ? post.description.slice(0, 200) + '...' : post.description;

    useEffect(() => {
        if (openModalPostId != null && post?.id === openModalPostId) {
            setOpenPostModal(true);
        }
    }, [openModalPostId, post?.id]);

    useEffect(() => {
        if (openModalForComments && post?.id) {
            setOpenPostModal(true);
            setScrollToCommentsAfterOpen(true);
            onConsumedCommentOpen?.();
        }
    }, [openModalForComments, post?.id, onConsumedCommentOpen]);

    const handlePostModalOpenChange = (open) => {
        setOpenPostModal(open);
        if (!open) {
            setScrollToCommentsAfterOpen(false);
            if (openModalPostId != null && post?.id === openModalPostId) {
                onConsumedHashModal?.();
            }
        }
    };

    return (
        <>
            <div className="mt-3 px-4">
                {post?.description && (
                    <>
                        <p className="w-full overflow-hidden text-sm break-words whitespace-pre-wrap text-gray-800 dark:text-light">
                            {renderPostText({ text: displayText, post })}
                        </p>
                        {hasMore && (
                            <button
                                onClick={() => toggleDescription(post?.id)}
                                className="mt-1 text-sm text-dark/50 hover:underline dark:text-light/50"
                            >
                                {isExpanded ? 'See less' : 'See more'}
                            </button>
                        )}
                    </>
                )}
            </div>

            {originalPost && (
                <div className="mt-3 px-4">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3 dark:border-white/10 dark:bg-dark/60">
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground dark:text-light/60">
                            <span>Reposted</span>
                            <span>•</span>
                            <Link href={takeToUserProfile(originalPost)} className="font-medium text-alpha hover:underline">
                                View original
                            </Link>
                        </div>

                        <div className="flex items-start gap-3">
                            <Link href={takeToUserProfile(originalPost)} className="shrink-0">
                                <Avatar
                                    className="h-9 w-9 overflow-hidden"
                                    image={originalPost?.user_image}
                                    name={originalPost?.user_name}
                                    lastActivity={originalPost?.user_last_login ?? originalPost?.user_last_online ?? originalPost?.user_last_activity ?? null}
                                    onlineCircleClass="hidden"
                                />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link href={takeToUserProfile(originalPost)} className="text-sm font-semibold text-beta hover:underline dark:text-light">
                                    {originalPost?.user_name}
                                </Link>
                                {originalPost?.description && (
                                    <p className="mt-1 line-clamp-4 text-sm break-words whitespace-pre-wrap text-foreground/90 dark:text-light/90">
                                        {renderPostText({ text: originalPost.description, post: originalPost })}
                                    </p>
                                )}
                                {Array.isArray(originalPost?.images) && originalPost.images.length > 0 && (
                                    <div className="mt-2">
                                        <img
                                            src={resolvePostImageUrl(originalPost.images[0]) ?? ''}
                                            alt=""
                                            className="h-44 w-full rounded-lg object-cover"
                                            onClick={() => setOpenPostModal(true)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {post?.images?.length > 0 && (
                <div
                    onClick={() => setOpenPostModal(true)}
                    className={`relative mt-3 aspect-video w-full cursor-pointer gap-3 px-1 ${post.images.length == 2 ? 'flex' : 'flex flex-col'}`}
                >
                    {/* Top big image */}
                    <img
                        src={resolvePostImageUrl(post?.images[0]) ?? ''}
                        alt=""
                        className={`rounded-lg object-cover ${post.images.length <= 2 ? (post.images.length == 2 ? 'h-full w-1/2' : 'h-full w-full') : 'h-[70%] w-full'}`}
                    />

                    {/* Bottom small images */}
                    {post?.images.length > 1 && (
                        <div className={`flex gap-3 ${post.images.length == 2 ? 'h-full w-1/2' : 'h-[30%] w-full'}`}>
                            {post?.images.slice(1, 5).map((img, i) => (
                                <div
                                    key={i}
                                    className={`relative h-full ${post.images.length - 1 < 4 ? `w-1/${post?.images.slice(1, 5).length}` : `w-1/4`}`}
                                >
                                    <img src={resolvePostImageUrl(img) ?? ''} alt="" className="h-full w-full rounded-lg object-cover" />

                                    {/* If more than 5 images → show +X overlay */}
                                    {i === 3 && post?.images.length > 5 && (
                                        <div
                                            onClick={() => setOpenPostModal(true)}
                                            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-xl text-white"
                                        >
                                            +{post?.images.length - 5}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {openPostModal && (
                <PostModal
                    isOpen={openPostModal}
                    onOpenChange={handlePostModalOpenChange}
                    post={modalPost}
                    displayText={displayText}
                    hasMore={hasMore}
                    isExpanded={isExpanded}
                    toggleDescription={toggleDescription}
                    timeAgo={timeAgo}
                    user={user}
                    addOrRemovFollow={addOrRemoveFollow}
                    takeToUserProfile={takeToUserProfile}
                    scrollToCommentsOnOpen={scrollToCommentsAfterOpen}
                    onScrollToCommentsConsumed={() => setScrollToCommentsAfterOpen(false)}
                />
            )}
        </>
    );
};

export default PostCardMainContent;
