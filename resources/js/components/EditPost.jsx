import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Close icon
import { router } from '@inertiajs/react';

const EditPost = ({ post, user, onOpenChange, onConfirm }) => {
    const [updatedPostText, setUpdatedPostText] = useState(post.description);

    // When post data changes, update the form state
    useEffect(() => {
        setUpdatedPostText(post.description);
    }, [post]);

    // Handle form submission (updating the post)
    const handleSubmit = () => {
        const updatedPost = {
            ...post,
            description: updatedPostText,
        };
        try {
            router.put(`/posts/post/${post.id}`, updatedPost)
            onConfirm(updatedPost); // Pass updated post to the parent (PostCard)
            onOpenChange(false); // Close the modal after update
            console.log('success Edit');
        } catch (error) {
            console.log('failed Edit : ' + error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-[#212529]">
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-200 dark:border-[#1f2326] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#ffc801] flex items-center justify-center text-[#171717] font-bold text-lg">
                            {user?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-[#171717] dark:text-[#fafafa]">
                                {user?.name}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)} // Close the modal
                        className="p-2 rounded-full transition hover:bg-gray-100 dark:hover:bg-[#1f2326] text-[#171717] dark:text-[#fafafa]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <textarea
                        value={updatedPostText}
                        onChange={(e) => setUpdatedPostText(e.target.value)}
                        placeholder="Edit your post content"
                        className="w-full min-h-[200px] resize-none text-lg outline-none bg-white dark:bg-[#212529] text-[#171717] dark:text-[#fafafa] placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-[#1f2326]">
                    <button
                        onClick={handleSubmit} // Submit the changes
                        disabled={!updatedPostText.trim()}
                        className={`px-6 py-2.5 rounded-full font-semibold transition ${updatedPostText.trim()
                            ? 'bg-[#ffc801] text-[#171717] hover:opacity-90'
                            : 'bg-gray-200 dark:bg-[#1f2326] text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPost;
