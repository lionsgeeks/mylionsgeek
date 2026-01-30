import { useState } from 'react';
import { helpers } from '../utils/helpers';
import PostModal from './PostModal';

const PostCardMainContent = ({ post, user, addOrRemoveFollow, timeAgo, takeToUserProfile }) => {
    const [openPostModal, setOpenPostModal] = useState(false);
    const { resolvePostImageUrl } = helpers();
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const toggleDescription = (id) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const hasMore = post?.description?.length > 120;
    const isExpanded = expandedDescriptions[post?.id];
    const displayText = hasMore && !isExpanded ? post.description.slice(0, 200) + '...' : post.description;
    // //console.log(displayText);
    return (
        <>
            <div className="mt-3 px-4">
                {post?.description && (
                    <>
                        <p className="w-full overflow-hidden text-sm break-words whitespace-pre-wrap text-gray-800 dark:text-light">{displayText}</p>
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
                    {openPostModal && (
                        <PostModal
                            isOpen={openPostModal}
                            onOpenChange={setOpenPostModal}
                            post={post}
                            displayText={displayText}
                            hasMore={hasMore}
                            isExpanded={isExpanded}
                            toggleDescription={toggleDescription}
                            timeAgo={timeAgo}
                            user={user}
                            addOrRemovFollow={addOrRemoveFollow}
                            takeToUserProfile={takeToUserProfile}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default PostCardMainContent;
