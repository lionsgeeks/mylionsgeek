import React, { useState } from 'react';
import PostModal from './PostModal';
import { helpers } from '../utils/helpers';

const PostCardMainContent = ({ post, user, addOrRemoveFollow, timeAgo, takeToUserProfile }) => {

    const [openPostModal, setOpenPostModal] = useState(false)
    const { resolvePostImageUrl } = helpers();
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    const toggleDescription = (id) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const hasMore = post?.description?.length > 120;
    const isExpanded = expandedDescriptions[post?.id];
    const displayText = hasMore && !isExpanded
        ? post.description.slice(0, 200) + '...'
        : post.description;
    // //console.log(displayText);
    return (
        <>
            <div className="mt-3 px-4">
                {post?.description && (
                    <>
                        <p className="text-gray-800 dark:text-light w-full text-sm whitespace-pre-wrap break-words overflow-hidden">
                            {displayText}
                        </p>
                        {hasMore && (
                            <button
                                onClick={() => toggleDescription(post?.id)}
                                className="dark:text-light/50 text-dark/50  text-sm mt-1 hover:underline"
                            >
                                {isExpanded ? 'See less' : 'See more'}
                            </button>
                        )}
                    </>
                )}
            </div>
            {post?.images?.length > 0 && (
                <div onClick={() => setOpenPostModal(true)} className={`relative w-full cursor-pointer px-1 aspect-video mt-3 gap-3 ${post.images.length == 2 ? 'flex' : 'flex flex-col'}`}>

                    {/* Top big image */}
                    <img
                        src={resolvePostImageUrl(post?.images[0]) ?? ''}
                        alt=""
                        className={`object-cover rounded-lg ${post.images.length <= 2 ? post.images.length == 2 ? 'h-full w-1/2' : 'w-full h-full' : 'h-[70%] w-full'}`}
                    />

                    {/* Bottom small images */}
                    {post?.images.length > 1 && (
                        <div className={`flex gap-3 ${post.images.length == 2 ? 'h-full w-1/2' : 'h-[30%] w-full'}`}>
                            {post?.images.slice(1, 5).map((img, i) => (
                                <div key={i} className={`relative h-full ${post.images.length - 1 < 4 ? `w-1/${post?.images.slice(1, 5).length}` : `w-1/4`}`}>
                                    <img
                                        src={resolvePostImageUrl(img) ?? ''}
                                        alt=""
                                        className="w-full h-full object-cover rounded-lg"
                                    />

                                    {/* If more than 5 images → show +X overlay */}
                                    {i === 3 && post?.images.length > 5 && (
                                        <div onClick={() => setOpenPostModal(true)} className="absolute cursor-pointer inset-0 bg-black/60 text-white text-xl flex items-center justify-center">
                                            +{post?.images.length - 5}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {openPostModal && <PostModal isOpen={openPostModal} onOpenChange={setOpenPostModal} post={post} displayText={displayText} hasMore={hasMore} isExpanded={isExpanded} toggleDescription={toggleDescription} timeAgo={timeAgo} user={user} addOrRemovFollow={addOrRemoveFollow} takeToUserProfile={takeToUserProfile} />}

                </div>
            )}
        </>
    );
};

export default PostCardMainContent;