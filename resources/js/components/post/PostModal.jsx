import { Avatar } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { helpers } from '../utils/helpers';
import PostCardFooter from './PostCardFooter';
import PostImageCarousel from './PostImageCarousel';

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
}) => {
    const { stopScrolling } = helpers();
    useEffect(() => {
        stopScrolling(true);
        return () => {
            stopScrolling(false);
        };
    });
    const changeOpen = (e) => {
        e.stopPropagation();
        onOpenChange(false);
    };
    return (
        <>
            <div onClick={(e) => changeOpen(e)} className="fixed inset-0 z-40 bg-black/70"></div>
            <div className="fixed inset-0 top-[5vh] z-50 mx-auto flex h-[90vh] w-full max-w-[80%] flex-col overflow-hidden rounded-lg bg-beta lg:flex-row dark:bg-dark_gray">
                {/* Close Button */}
                <button
                    onClick={(e) => changeOpen(e)}
                    className="absolute top-4 right-4 z-50 cursor-pointer rounded-full bg-beta/80 p-2 transition-colors hover:bg-beta dark:bg-dark/80 dark:hover:bg-dark"
                >
                    <X className="h-6 w-6 text-light" />
                </button>

                {/* Left Side - Image/Content Preview */}
                <div className="flex w-full items-center justify-center bg-dark_gray p-4 lg:w-3/5 lg:p-8 dark:bg-dark">
                    <div className="flex h-full w-full items-center justify-center">
                        <PostImageCarousel images={post?.images} />
                    </div>
                </div>

                {/* Right Side - Post Details */}
                <div className="flex w-full flex-col bg-light lg:w-2/5 dark:bg-dark_gray">
                    {/* Header */}
                    <div className="border-b border-beta/10 p-4 dark:border-light/10">
                        <div className="flex items-start gap-3">
                            <Avatar
                                className="relative z-50 h-12 w-12 overflow-hidden"
                                image={post?.user_image}
                                name={post?.user_name}
                                lastActivity={post?.user_last_online || null}
                                onlineCircleClass="hidden"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-beta dark:text-light">{post?.user_name}</h3>
                                    {user?.id != post.user_id && (
                                        <span
                                            onClick={() => addOrRemovFollow(post?.user_id, post?.is_following)}
                                            className="cursor-pointer text-xs text-gray-500 dark:text-alpha"
                                        >
                                            • {post?.is_following ? 'Unfollow' : 'Follow'}
                                        </span>
                                    )}
                                </div>
                                {/* <p className="text-xs text-beta/70 dark:text-light/70">
                                    {post?.subtitle || "Web Developer | Technicien spécialisé in Web..."}
                                </p> */}
                                <p className="mt-1 flex items-center gap-1 text-xs text-beta/60 dark:text-light/60">
                                    <span>{timeAgo(post?.created_at)}</span>
                                    {/* <span>•</span>
                                    <span>🌐</span> */}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <>
                            <p className="w-full overflow-hidden text-sm break-words whitespace-pre-wrap text-gray-800 dark:text-light">
                                {displayText}
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

                        {/* Hashtags */}
                        {/* <div className="mt-3 flex flex-wrap gap-2">
                            {(post?.hashtags || ['#ReactJS', '#TailwindCSS', '#FramerMotion']).map((tag, idx) => (
                                <span key={idx} className="text-sm text-alpha hover:underline cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div> */}

                        <PostCardFooter post={post} user={user} takeToUserProfile={takeToUserProfile} PostModal={true} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostModal;
