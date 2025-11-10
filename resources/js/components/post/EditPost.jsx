import React, { useState } from 'react';
import { X, Image, Calendar, Award, Plus, Smile, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const EditPost = ({ user, open, onOpenChange, post, postText, onPostTextChange, postImage, onPostImageChange, onConfirm }) => {
    const [preview, setPreview] = useState(post?.image ? `/storage/img/posts/${post.image}` : null);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-[70%] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl bg-light dark:bg-beta overflow-hidden transition-all duration-300">

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-dark_gray flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar
                            className="w-12 h-12 overflow-hidden"
                            image={user?.image}
                            name={user?.name}
                            lastActivity={user?.last_online || null}
                            onlineCircleClass="hidden"
                        />
                        <div>
                            <h3 className="font-semibold text-base text-dark dark:text-light">{user?.name}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Editing post</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark_gray text-dark dark:text-light transition"
                        aria-label="Close modal"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-4 px-5 py-4 overflow-y-auto">
                    <textarea
                        value={postText}
                        onChange={(e) => onPostTextChange(e.target.value)}
                        placeholder="What do you want to talk about?"
                        className="w-full min-h-[180px] resize-none text-lg outline-none bg-transparent text-dark dark:text-light placeholder-gray-400 dark:placeholder-gray-500 p-3"
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full  object-cover rounded-xl"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-dark_gray bg-white/50 dark:bg-beta/70 backdrop-blur-sm">
                    <div className="flex w-full items-center justify-between mb-3">
                        <label
                            htmlFor="imageUpload"
                            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer dark:hover:bg-dark_gray text-gray-600 dark:text-gray-400 transition flex items-center justify-center"
                        >
                            <Image size={20} />
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                // onChange={(e) => onPostImageChange(e.target.files[0])} // your handler
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const newPreview = URL.createObjectURL(file);
                                    setPreview(newPreview);
                                    console.log(postImage);
                                    
                                    onPostImageChange(file); // now uses the right URL
                                    console.log(postImage);
                                }}
                                className="hidden"
                            />
                        </label>
                        <button
                            disabled={!postText.trim()}
                            onClick={onConfirm}
                            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-sm
            ${postText.trim()
                                    ? 'bg-alpha text-dark hover:opacity-90'
                                    : 'bg-gray-200 dark:bg-dark_gray text-gray-400 cursor-not-allowed'}
          `}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default EditPost;