import React, { useState } from 'react';
import { X, Image, Calendar, Award, Plus, Smile, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const EditPost = ({ user, open, onOpenChange, post, postText, onPostTextChange, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-[#212529]">

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-[#1f2326] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar
                                className="w-12 h-12 overflow-hidden relative z-50"
                                image={user?.image}
                                name={user?.name}
                                lastActivity={user?.last_online || null}
                                onlineCircleClass="hidden"
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base text-[#171717] dark:text-[#fafafa]">
                                    {user?.name}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-full transition hover:bg-gray-100 dark:hover:bg-[#1f2326] text-[#171717] dark:text-[#fafafa]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <textarea
                        value={postText}
                        onChange={(e) => onPostTextChange(e.target.value)}
                        placeholder="What do you want to talk about?"
                        className="w-full min-h-[200px] resize-none text-lg outline-none bg-white dark:bg-[#212529] text-[#171717] dark:text-[#fafafa] placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-[#1f2326]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {[Image, Calendar, Award, Plus].map((Icon, i) => (
                                <button
                                    key={i}
                                    className="p-2 rounded-full transition text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1f2326]"
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>

                        <button className="p-2 rounded-full transition text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1f2326]">
                            <Smile size={20} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <button className="p-2 rounded-full transition flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1f2326]">
                            <Clock size={20} />
                        </button>

                        <button
                            disabled={!postText.trim()}
                            onClick={onConfirm}
                            className={`px-6 py-2.5 rounded-full font-semibold transition 
                ${postText.trim()
                                    ? 'bg-[#ffc801] text-[#171717] hover:opacity-90'
                                    : 'bg-gray-200 dark:bg-[#1f2326] text-gray-400 cursor-not-allowed'}`}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default EditPost;