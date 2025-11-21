import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { helpers, MAX_POST_IMAGES } from '../utils/helpers';
import PostModalShell from './composer/PostModalShell';
import PostTextarea from './composer/PostTextarea';
import PostMediaGrid from './composer/PostMediaGrid';
import PostMediaPicker from './composer/PostMediaPicker';

const EditPost = ({ user, onOpenChange, post }) => {
    const {
        stopScrolling,
        buildImageEntries,
        revokePreviewUrls,
        mapExistingImages,
        createImageRemovalHandler,
    } = helpers();

    const [existingImages, setExistingImages] = useState(() =>
        mapExistingImages(post?.images)
    );
    const [newImages, setNewImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');
    const newImagesRef = useRef([]);

    const form = useForm({
        description: post?.description ?? '',
        keep_images: post?.images ?? [],
        removed_images: [],
        new_images: [],
    });

    const displayedImages = useMemo(
        () => [...existingImages, ...newImages],
        [existingImages, newImages]
    );

    useEffect(() => {
        newImagesRef.current = newImages;
    }, [newImages]);

    useEffect(() => {
        stopScrolling(true);
        return () => {
            stopScrolling(false);
            revokePreviewUrls(newImagesRef.current);
        };
    }, []);

    useEffect(() => {
        setExistingImages(mapExistingImages(post?.images));
        setNewImages([]);
        setRemovedImages([]);
        setLimitMessage('');
        form.reset({
            description: post?.description ?? '',
            keep_images: post?.images ?? [],
            removed_images: [],
            new_images: [],
        });
    }, [post?.id]);

    useEffect(() => {
        form.setData('keep_images', existingImages.map((image) => image.id));
    }, [existingImages]);

    useEffect(() => {
        form.setData('new_images', newImages.map(({ file }) => file));
    }, [newImages]);

    useEffect(() => {
        form.setData('removed_images', removedImages);
    }, [removedImages]);

    const handleImageSelection = async (event) => {
        const files = event.target.files;
        if (!files?.length || form.processing) return;

        setIsUploading(true);
        setLimitMessage('');

        try {
            const { entries, rejected } = await buildImageEntries(files, displayedImages.length);
            setNewImages((prev) => [...prev, ...entries]);
            if (rejected > 0) {
                setLimitMessage(`You can keep or upload up to ${MAX_POST_IMAGES} images per post.`);
            }
        } catch (error) {
            console.error('Failed to add images', error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const removeImage = useMemo(
        () => createImageRemovalHandler({
            revokePreviewUrls,
            updateExistingImages: setExistingImages,
            updateNewImages: setNewImages,
            trackRemovedImage: setRemovedImages,
        }),
        [createImageRemovalHandler, revokePreviewUrls]
    );

    const handleRemoveImage = (image) => {
        removeImage(image);
    };

    const resetForm = () => {
        revokePreviewUrls(newImages);
        setNewImages([]);
        setRemovedImages([]);
        setExistingImages(mapExistingImages(post?.images));
        setLimitMessage('');
        form.reset({
            description: post?.description ?? '',
            keep_images: post?.images ?? [],
            removed_images: [],
            new_images: [],
        });
        form.clearErrors();
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (form.processing || (displayedImages.length === 0 && !form.data.description.trim() && removedImages.length === 0)) {
            return;
        }

        form.post(`/posts/post/${post?.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
            },
        });
    };

    const canSubmit =
        !!form.data.description.trim() ||
        displayedImages.length > 0 ||
        removedImages.length > 0;

    return (
        <PostModalShell
            user={user}
            title="Edit post"
            onClose={handleClose}
            showLoader={form.processing}
            loaderMessage="Updating post..."
            footer={
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <PostMediaPicker
                            id="edit-post-media"
                            onChange={handleImageSelection}
                            disabled={form.processing}
                        />
                        <p className="text-xs text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/60">
                            {displayedImages.length}/{MAX_POST_IMAGES} images selected
                        </p>
                    </div>
                    <button
                        disabled={!canSubmit || form.processing || isUploading}
                        onClick={handleSubmit}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-md ${canSubmit
                            ? 'bg-[var(--color-alpha)] text-[var(--color-beta)] hover:scale-105 active:scale-95'
                            : 'bg-[var(--color-dark_gray)]/30 dark:bg-[var(--color-light)]/10 text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/40 cursor-not-allowed opacity-60'
                            }`}
                    >
                        {form.processing ? 'Updating...' : 'Update'}
                    </button>
                </div>
            }
        >
            <PostTextarea
                value={form.data.description}
                onChange={(e) => form.setData('description', e.target.value)}
                placeholder="What do you want to talk about?"
                disabled={form.processing}
            />
            <InputError message={form.errors.description} />
            <PostMediaGrid
                images={displayedImages}
                onRemove={handleRemoveImage}
                isLoading={isUploading}
            />
            <InputError message={limitMessage || form.errors.new_images} />
        </PostModalShell>
    );
};

export default EditPost;
