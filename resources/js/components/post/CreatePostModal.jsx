import React, { useState } from 'react';
import { X, Image, Calendar, Award, Plus, Smile, Clock } from 'lucide-react';

const CreatePostModal = () => {
    const [postText, setPostText] = useState('');
    const [showModal, setShowModal] = useState(true);
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col bg-white dark:bg-[#212529]">

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-[#1f2326] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-[#ffc801] flex items-center justify-center text-[#171717] font-bold text-lg">
                                YM
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#51b04f] rounded-full border-2 border-white dark:border-[#212529]"></div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base text-[#171717] dark:text-[#fafafa]">
                                    Yahya Moussair
                                </h3>
                                <button className="text-sm px-2 py-0.5 rounded text-gray-600 hover:text-[#171717] dark:text-gray-400 dark:hover:text-[#fafafa]">
                                    ▼
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Post to Anyone</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(false)}
                        className="p-2 rounded-full transition hover:bg-gray-100 dark:hover:bg-[#1f2326] text-[#171717] dark:text-[#fafafa]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
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
export default CreatePostModal;