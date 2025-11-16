import React, { useState } from 'react';
import { X, Heart, MessageCircle, Repeat2, Send, BarChart2, Smile, Image } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const PostModal = ({ isOpen, onClose, post, onExpandedDescriptionsChange, expandedDescriptions, hasMore, displayText, timeAgo, user, addOrRemovFollow }) => {

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70">
            </div>
            <div className="fixed inset-0 z-50 mx-auto top-[5vh] w-full max-w-[80%] h-[90vh] bg-beta dark:bg-dark_gray rounded-lg overflow-hidden flex flex-col lg:flex-row">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-beta/80 dark:bg-dark/80 hover:bg-beta dark:hover:bg-dark transition-colors"
                >
                    <X className="w-6 h-6 text-light" />
                </button>

                {/* Left Side - Image/Content Preview */}
                <div className="w-full lg:w-3/5 bg-dark_gray dark:bg-dark flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={post?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
                            alt="Post content"
                            className="max-w-full max-h-full object-contain rounded"
                        />
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
                        <div className="text-sm text-beta dark:text-light whitespace-pre-wrap break-words">
                            {displayText}
                            {hasMore && (
                                <button
                                    onClick={() => onExpandedDescriptionsChange(!expandedDescriptions)}
                                    className="text-beta/70 dark:text-light/70 hover:text-beta dark:hover:text-light ml-2 font-medium"
                                >
                                    {expandedDescriptions ? '...see less' : '...more'}
                                </button>
                            )}
                        </div>

                        {/* Hashtags */}
                        {/* <div className="mt-3 flex flex-wrap gap-2">
                            {(post?.hashtags || ['#ReactJS', '#TailwindCSS', '#FramerMotion']).map((tag, idx) => (
                                <span key={idx} className="text-sm text-alpha hover:underline cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div> */}

                        {/* Engagement Stats */}
                        <div className="mt-4 pt-3 border-t border-beta/10 dark:border-light/10">
                            <div className="flex items-center gap-2 text-xs text-beta/70 dark:text-light/70">
                                <div className="flex items-center gap-1">
                                    <div className="flex -space-x-1">
                                        <div className="w-5 h-5 rounded-full bg-alpha flex items-center justify-center text-xs">👍</div>
                                        <div className="w-5 h-5 rounded-full bg-error flex items-center justify-center text-xs">❤️</div>
                                    </div>
                                    <span>{post?.likes || '15'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-beta/10 dark:border-light/10 p-3">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-beta/5 dark:hover:bg-light/5 transition-colors">
                                <Heart className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                <span className="text-xs text-beta/70 dark:text-light/70">Love</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-beta/5 dark:hover:bg-light/5 transition-colors">
                                <MessageCircle className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                <span className="text-xs text-beta/70 dark:text-light/70">Comment</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-beta/5 dark:hover:bg-light/5 transition-colors">
                                <Repeat2 className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                <span className="text-xs text-beta/70 dark:text-light/70">Repost</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-beta/5 dark:hover:bg-light/5 transition-colors">
                                <Send className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                <span className="text-xs text-beta/70 dark:text-light/70">Send</span>
                            </button>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between p-2 bg-beta/5 dark:bg-light/5 rounded">
                            <div className="flex items-center gap-2 text-xs text-beta/70 dark:text-light/70">
                                <BarChart2 className="w-4 h-4" />
                                <span>{post?.impressions || '695'} impressions</span>
                            </div>
                            <button className="text-xs text-alpha hover:underline">
                                View analytics
                            </button>
                        </div>

                        {/* Comment Input */}
                        <div className="mt-3 flex items-center gap-2">
                            <img
                                src={post?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
                                alt="Your profile"
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 flex items-center gap-2 bg-beta/5 dark:bg-light/5 rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Tell them what you loved..."
                                    className="flex-1 bg-transparent text-sm text-beta dark:text-light outline-none placeholder:text-beta/50 dark:placeholder:text-light/50"
                                />
                                <button className="p-1 hover:bg-beta/10 dark:hover:bg-light/10 rounded-full">
                                    <Smile className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                </button>
                                <button className="p-1 hover:bg-beta/10 dark:hover:bg-light/10 rounded-full">
                                    <Image className="w-5 h-5 text-beta/70 dark:text-light/70" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostModal;

// Demo Component
// export default function App() {
//     const [isModalOpen, setIsModalOpen] = useState(true);

//     const mockPost = {
//         author: "Yahya Moussair",
//         subtitle: "Web Developer | Technicien spécialisé in Web...",
//         visibility: "5mo",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
//         image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
//         description: `🚀 I'm excited to share my brand-new developer portfolio—built from scratch with React.js, Vite, Tailwind CSS, and Framer Motion!

// This fully responsive site reflects who I am as a developer: focused on clean UI, smooth animations, and optimized performance across all devices.

// 🧠 Tech Stack:
// React.js | Vite | Tailwind CSS | Framer Motion

// 🎯 It's not just a portfolio — it's a step forward in my journey as an aspiring Software Engineer. I'd love your feedback, and I'm open to opportunities to grow and contribute to great teams.

// 🔗 [https://lnkd.in/eE6SqC-F ✅]
// Let's connect!`,
//         hashtags: ['#ReactJS', '#TailwindCSS', '#FramerMotion'],
//         likes: '15',
//         impressions: '695'
//     };

//     return (
//         <div className="min-h-screen bg-light dark:bg-dark p-8">
//             <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="px-6 py-3 bg-alpha text-beta rounded-lg font-medium hover:bg-alpha/90 transition-colors"
//             >
//                 Open Post Modal
//             </button>

//             <PostModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 post={mockPost}
//             />
//         </div>
//     );
// }