import React, { useEffect, useState } from 'react';
import { X, Image } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';
import { helpers } from '../utils/helpers';
import { compressFiles, generateLocalId } from '@/utils/imageProcessing';

const CreatePostModal = ({ onOpenChange, user }) => {
    const [postText, setPostText] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const { stopScrolling } = helpers()
    useEffect(() => {
        stopScrolling(true); // freeze scroll on open

        return () => {
            stopScrolling(false); // restore scroll on unmount
        };
    }, []);
    const handleImagePreviews = async (event) => {
        const files = event.target.files;
        if (!files?.length) return;

        setIsUploading(true);
        try {
            const compressedFiles = await compressFiles(files);
            const newEntries = compressedFiles.map((file) => ({
                id: generateLocalId(),
                file,
                preview: URL.createObjectURL(file),
                kind: 'new',
            }));
            setSelectedImages((prev) => [...prev, ...newEntries]);
        } catch (error) {
            console.error('Failed to process images', error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const removeImage = (imageId) => {
        setSelectedImages((prev) => {
            const imageToRemove = prev.find((img) => img.id === imageId);
            if (imageToRemove?.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter((img) => img.id !== imageId);
        });
    };

    const resetForm = () => {
        selectedImages.forEach((image) => {
            if (image.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(image.preview);
            }
        });
        setSelectedImages([]);
        setPostText('');
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };
    //! create post
    const handelCreatePost = () => {
        const newFormData = new FormData()
        newFormData.append('description', postText)
        selectedImages.forEach(({ file }) => {
            newFormData.append('new_images[]', file);
        });

        router.post('/posts/store/post', newFormData, {
            forceFormData: true,
            onSuccess: handleClose,
            onError: (error) => {
                console.log(error);
            }
        })
    }
    const hasImages = selectedImages.length > 0;
    const canSubmit = !!postText.trim() || hasImages;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                className="fixed inset-0 h-full z-30 bg-[var(--color-dark)]/50 dark:bg-[var(--color-beta)]/60 backdrop-blur-md transition-all duration-300"
            />

            {/* Modal Container */}
            <div className="
        w-full fixed inset-0 z-40 mx-auto top-1/2 -translate-y-1/2 max-w-[55%] h-[85vh]
        flex flex-col rounded-3xl shadow-2xl 
        border border-[var(--color-dark_gray)]/30 dark:border-[var(--color-light)]/10
        bg-[var(--color-light)] dark:bg-[var(--color-dark)]
        overflow-hidden transition-all duration-300
        animate-in fade-in slide-in-from-bottom-4
    ">

                {/* Header */}
                <div className="
            relative p-6 border-b border-[var(--color-dark_gray)]/20 dark:border-[var(--color-light)]/10
            bg-gradient-to-r from-[var(--color-light)]/40 to-transparent
            dark:from-[var(--color-dark_gray)]/40
        ">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar
                                    className="w-14 h-14 overflow-hidden ring-2 ring-[var(--color-light)] dark:ring-[var(--color-dark_gray)]"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />

                                <div className="
                            absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-good)] rounded-full 
                            border-2 border-[var(--color-light)] dark:border-[var(--color-dark)]
                        " />
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-[var(--color-beta)] dark:text-[var(--color-light)]">
                                    {user?.name}
                                </h3>
                                <span className="text-sm text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/60 font-medium">
                                    Create post
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="
                        p-2.5 rounded-full 
                        hover:bg-[var(--color-light)]/60 dark:hover:bg-[var(--color-dark_gray)]
                        text-[var(--color-beta)] dark:text-[var(--color-light)]
                        transition-all duration-200 hover:scale-110 active:scale-95
                    "
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="
            flex-1 flex flex-col gap-5 px-6 py-5 overflow-y-auto
            scrollbar-thin scrollbar-thumb-[var(--color-dark_gray)]/40 dark:scrollbar-thumb-[var(--color-light)]/20 
            scrollbar-track-transparent
        ">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What do you want to talk about?"
                        className="
                    w-full min-h-[120px] resize-none text-lg outline-none bg-transparent
                    text-[var(--color-beta)] dark:text-[var(--color-light)]
                    placeholder-[var(--color-dark_gray)] dark:placeholder-[var(--color-light)]/50
                    p-4 rounded-xl
                    hover:bg-[var(--color-light)]/40 dark:hover:bg-[var(--color-dark_gray)]/40
                    focus:bg-[var(--color-light)] dark:focus:bg-[var(--color-dark_gray)]
                    transition-all duration-200 whitespace-pre-wrap
                "
                        rows="4"
                    />

                    {/* IMAGE PREVIEWS */}
                    {hasImages && (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedImages.map((image) => (
                                <div key={image.id} className="relative group rounded-2xl overflow-hidden shadow">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-error/90 hover:bg-error text-light shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                                        aria-label="Remove image"
                                    >
                                        <X size={16} />
                                    </button>
                                    <img
                                        src={image.preview}
                                        alt="Selected media"
                                        className="w-full h-[45vh] object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="
            p-6 border-t border-[var(--color-dark_gray)]/20 dark:border-[var(--color-light)]/10
            bg-gradient-to-r from-[var(--color-light)]/60 to-transparent
            dark:from-[var(--color-dark_gray)]/40 backdrop-blur-sm
        ">
                    <div className="flex w-full items-center justify-between">

                        <label
                            htmlFor="imageUpload"
                            className="
                        flex items-center gap-2 px-4 py-2.5 rounded-xl
                        hover:bg-[var(--color-light)] dark:hover:bg-[var(--color-dark_gray)]
                        cursor-pointer
                        text-[var(--color-beta)] dark:text-[var(--color-light)]
                        transition-all duration-200 hover:scale-105 active:scale-95 group
                    "
                        >
                            <Image size={22} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Add photos</span>

                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleImagePreviews}
                                className="hidden"
                            />
                        </label>

                        <button
                            disabled={!canSubmit || isUploading}
                            onClick={() => handelCreatePost()}
                            className={`
                        px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-md
                        ${canSubmit
                                    ? 'bg-[var(--color-alpha)] text-[var(--color-beta)] hover:scale-105 active:scale-95'
                                    : 'bg-[var(--color-dark_gray)]/30 dark:bg-[var(--color-light)]/10 text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/40 cursor-not-allowed opacity-60'
                                }
                    `}
                        >
                            Post
                        </button>

                    </div>
                </div>
            </div>
        </>

    );
}
export default CreatePostModal;