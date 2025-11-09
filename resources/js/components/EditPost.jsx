import React, { useState } from 'react';
import { X, Image as ImageIcon, Smile, Clock, Calendar, Award, Plus } from 'lucide-react';
import { Avatar } from './ui/avatar';

const EditPost = ({ post, user, onOpenChange, onUpdate }) => {
    const [postText, setPostText] = useState(post.description);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!postText.trim()) return;
        onUpdate(post.id, postText, imageFile);
    };

    const currentImageSrc = previewImage || `/storage/posts/${post.image}`;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col bg-white dark:bg-[#212529] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-[#2a2d31] flex items-center justify-between bg-gradient-to-b from-gray-50/50 to-transparent dark:from-[#1a1d21]/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar
                                className="w-14 h-14 ring-2 ring-white dark:ring-[#212529] shadow-lg"
                                image={user.image}
                                name={user.name}
                                lastActivity={user.last_online || null}
                                onlineCircleClass="hidden"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#212529]"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#171717] dark:text-[#fafafa] mb-0.5">
                                {user.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Post to Anyone</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-[#2a2d31] text-gray-600 dark:text-gray-400 hover:text-[#171717] dark:hover:text-[#fafafa] hover:rotate-90 duration-200"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Textarea Section */}
                    <div className="p-6 pb-4">
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="What do you want to talk about?"
                            rows={4}
                            className="w-full resize-none text-lg leading-relaxed outline-none bg-transparent text-[#171717] dark:text-[#fafafa] placeholder-gray-400 dark:placeholder-gray-500 focus:placeholder-gray-300 dark:focus:placeholder-gray-600 transition-colors"
                        />
                    </div>

                    {/* Image Section */}
                    <div className="px-6 pb-6">
                        <div
                            className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a1d21] shadow-inner group"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {/* Image Preview */}
                            <img
                                src={currentImageSrc}
                                className="w-full h-auto max-h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                                alt="Post content"
                            />

                            {/* Image Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                {isHovering && (
                                    <label
                                        htmlFor="imageUpload"
                                        className="px-4 py-2 bg-white/90 dark:bg-[#212529]/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#171717] dark:text-[#fafafa] shadow-lg hover:bg-white dark:hover:bg-[#2a2d31] transition-all cursor-pointer"
                                    >
                                        Change Image
                                    </label>
                                )}
                            </div>

                            {/* Hidden Input for File Selection */}
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-gray-100 dark:border-[#2a2d31] bg-gradient-to-t from-gray-50/30 to-transparent dark:from-[#1a1d21]/30">
                    <div className="flex items-center justify-between mb-5">
                        {/* Media Icons */}
                        <div className="flex items-center gap-1">
                            {[ImageIcon, Calendar, Award, Plus].map((Icon, i) => (
                                <button
                                    key={i}
                                    title="Add media"
                                    className="p-2.5 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-[#171717] dark:hover:text-[#fafafa] hover:bg-gray-100 dark:hover:bg-[#2a2d31] cursor-pointer"
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>

                        {/* Emoji Button */}
                        <button
                            title="Add emoji"
                            className="p-2.5 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-[#171717] dark:hover:text-[#fafafa] hover:bg-gray-100 dark:hover:bg-[#2a2d31] cursor-pointer"
                        >
                            <Smile size={20} />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3">
                        <button className="p-2.5 rounded-lg transition-all flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#171717] dark:hover:text-[#fafafa] hover:bg-gray-100 dark:hover:bg-[#2a2d31] cursor-pointer">
                            <Clock size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Schedule</span>
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!postText.trim()}
                            className={`px-8 py-3 rounded-full font-bold text-base transition-all duration-200 shadow-md
                ${postText.trim()
                                    ? 'bg-[#ffc801] text-[#171717] hover:bg-[#ffb700] hover:shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-gray-200 dark:bg-[#2a2d31] text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'}`}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPost;