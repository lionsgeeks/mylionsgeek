import React, { useEffect, useMemo, useState } from 'react';
import { X, Image, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Avatar } from '@/components/ui/avatar';
import { compressFiles, generateLocalId } from '@/utils/imageProcessing';

const formatExistingImages = (images = []) =>
    (images || []).map((image) => ({
        id: image,
        name: image,
        preview: image?.startsWith('http') ? image : `/storage/img/posts/${image}`,
        kind: 'existing',
    }));

const revokePreview = (image) => {
    if (image?.kind === 'new' && image.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview);
    }
};

const EditPost = ({ user, onOpenChange, post }) => {
    const [description, setDescription] = useState(post?.description ?? '');
    const [existingImages, setExistingImages] = useState(() =>
        formatExistingImages(post?.images)
    );
    const [newImages, setNewImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDescription(post?.description ?? '');
        setExistingImages(formatExistingImages(post?.images));
        newImages.forEach(revokePreview);
        setNewImages([]);
        setRemovedImages([]);
    }, [post?.id]);

    const displayedImages = useMemo(
        () => [...existingImages, ...newImages],
        [existingImages, newImages]
    );

    const handleClose = () => {
        newImages.forEach(revokePreview);
        setNewImages([]);
        setRemovedImages([]);
        setExistingImages(formatExistingImages(post?.images));
        setDescription(post?.description ?? '');
        onOpenChange(false);
    };

    const handleImageSelection = async (event) => {
        const files = event.target.files;
        if (!files?.length) return;

        try {
            const compressedFiles = await compressFiles(files);
            const entries = compressedFiles.map((file) => ({
                id: generateLocalId(),
                file,
                preview: URL.createObjectURL(file),
                kind: 'new',
            }));
            setNewImages((prev) => [...prev, ...entries]);
        } catch (error) {
            console.error('Failed to add images', error);
        } finally {
            event.target.value = '';
        }
    };

    const handleRemoveImage = (image) => {
        if (image.kind === 'existing') {
            setExistingImages((prev) => prev.filter((img) => img.id !== image.id));
            setRemovedImages((prev) =>
                prev.includes(image.id) ? prev : [...prev, image.id]
            );
        } else {
            revokePreview(image);
            setNewImages((prev) => prev.filter((img) => img.id !== image.id));
        }
    };

    const handleUpdate = () => {
        const formData = new FormData();
        formData.append('description', description ?? '');

        existingImages.forEach((image) => {
            formData.append('keep_images[]', image.id);
        });

        removedImages.forEach((image) => {
            formData.append('removed_images[]', image);
        });

        newImages.forEach(({ file }) => {
            formData.append('new_images[]', file);
        });

        setIsSaving(true);
        router.post(`/posts/post/${post?.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSaving(false);
                handleClose();
            },
            onError: () => {
                setIsSaving(false);
            },
        });
    };

    const canSubmit =
        !!description?.trim() ||
        existingImages.length > 0 ||
        newImages.length > 0 ||
        removedImages.length > 0;

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed inset-0 h-full z-30 bg-black/40 backdrop-blur-md transition-all duration-300"
            />

            <div className="w-full fixed inset-0 z-40 mx-auto top-1/2 transform -translate-y-1/2 max-w-[55%] h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 bg-light dark:bg-beta overflow-hidden transition-all duration-300">
                <div className="relative p-6 border-b border-gray-200/80 dark:border-dark_gray bg-gradient-to-r from-gray-50/50 to-transparent dark:from-dark_gray/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar
                                    className="w-14 h-14 overflow-hidden ring-2 ring-gray-100 dark:ring-dark_gray"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-good rounded-full border-2 border-light dark:border-beta" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-dark dark:text-light">
                                    {user?.name}
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    Edit post
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark_gray text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-5 px-6 py-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What do you want to talk about?"
                        className="w-full min-h-[120px] resize-none text-lg outline-none bg-transparent text-dark dark:text-light placeholder-gray-400 dark:placeholder-gray-500 p-4 rounded-xl hover:bg-gray-50/50 dark:hover:bg-dark_gray/30 focus:bg-gray-50 dark:focus:bg-dark_gray/50 transition-all duration-200 whitespace-pre-wrap"
                        rows="4"
                    />

                    {displayedImages.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {displayedImages.map((image) => (
                                <div key={image.id} className="relative group rounded-2xl overflow-hidden shadow">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(image)}
                                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-error/90 hover:bg-error text-light shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                                        aria-label="Remove image"
                                    >
                                        <Trash2 size={16} />
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

                <div className="p-6 border-t border-gray-200/80 dark:border-dark_gray bg-gradient-to-r from-gray-50/80 to-transparent dark:from-dark_gray/50 backdrop-blur-sm">
                    <div className="flex w-full items-center justify-between">
                        <label
                            htmlFor="editImageUpload"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark_gray cursor-pointer text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 group"
                        >
                            <Image size={22} className="group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-sm font-medium">
                                Add photos
                            </span>
                            <input
                                id="editImageUpload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelection}
                                className="hidden"
                            />
                        </label>

                        <button
                            disabled={!canSubmit || isSaving}
                            onClick={handleUpdate}
                            className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-md
                                ${canSubmit
                                    ? 'bg-alpha text-dark hover:bg-alpha/90 hover:shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-gray-200 dark:bg-dark_gray text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'}
                            `}
                        >
                            {isSaving ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditPost;