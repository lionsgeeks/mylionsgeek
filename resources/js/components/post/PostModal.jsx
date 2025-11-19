import React, { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Repeat2, Send, BarChart2, Smile, Image } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import PostCardFooter from './PostCardFooter';
import PostImageCarousel from './PostImageCarousel';
import { helpers } from '../utils/helpers';

const PostModal = ({ isOpen, onOpenChange, post, isExpanded, hasMore, displayText, timeAgo, user, addOrRemovFollow, toggleDescription, takeToUserProfile }) => {
    const { stopScrolling } = helpers()
    useEffect(() => {
        stopScrolling(true)
        return () => {
            stopScrolling(false);
        }
    })
    const changeOpen = (e) => {
        e.stopPropagation()
        onOpenChange(false)
    }
    return (
        <>
            <div onClick={(e) => changeOpen(e)} className="fixed inset-0 z-40 bg-black/70">
            </div>
            <div className="fixed inset-0 top-[5vh] z-50 mx-auto w-full max-w-[80%] h-[90vh] bg-beta dark:bg-dark_gray rounded-lg overflow-hidden flex flex-col lg:flex-row">

                {/* Close Button */}
                <button
                    onClick={(e) => changeOpen(e)}
                    className="absolute top-4 right-4 z-50 cursor-pointer p-2 rounded-full bg-beta/80 dark:bg-dark/80 hover:bg-beta dark:hover:bg-dark transition-colors"
                >
                    <X className="w-6 h-6 text-light" />
                </button>

                {/* Left Side - Image/Content Preview */}
                <div className="w-full lg:w-3/5 bg-dark_gray dark:bg-dark flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full h-full flex items-center justify-center">
                        <PostImageCarousel images={post?.images} />
                    </div>
                </div>

                {/* Right Side - Post Details */}
                <div className="w-full lg:w-2/5 bg-light dark:bg-dark_gray flex flex-col">

                    {/* Header */}
                    <div className="p-4 border-b border-beta/10 dark:border-light/10">
                        <div className="flex items-start gap-3">
                            <Avatar
                                className="w-12 h-12 overflow-hidden relative z-50"
                                image={post?.user_image}
                                name={post?.user_name}
                                lastActivity={post?.user_last_online || null}
                                onlineCircleClass="hidden"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-beta dark:text-light">
                                        {post?.user_name}
                                    </h3>
                                    {user?.id != post.user_id &&
                                        <span onClick={() => addOrRemovFollow(post?.user_id, post?.is_following)} className="text-gray-500 dark:text-alpha text-xs cursor-pointer">
                                            • {post?.is_following ? 'Unfollow' : 'Follow'}
                                        </span>
                                    }
                                </div>
                                {/* <p className="text-xs text-beta/70 dark:text-light/70">
                                    {post?.subtitle || "Web Developer | Technicien spécialisé in Web..."}
                                </p> */}
                                <p className="text-xs text-beta/60 dark:text-light/60 flex items-center gap-1 mt-1">
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