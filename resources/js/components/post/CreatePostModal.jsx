import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { helpers, MAX_POST_IMAGES } from '../utils/helpers';
import PostModalShell from './composer/PostModalShell';
import PostTextarea from './composer/PostTextarea';
import PostMediaPicker from './composer/PostMediaPicker';
import PostMediaGrid from './composer/PostMediaGrid';

const CreatePostModal = ({ onOpenChange, user }) => {
    const {
        stopScrolling,
        buildImageEntries,
        revokePreviewUrls,
        createImageRemovalHandler,
    } = helpers();
    const [selectedImages, setSelectedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');
    const imagesRef = useRef([]);

    const form = useForm({
        description: '',
        images: [],
    });

    useEffect(() => {
        imagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        stopScrolling(true);
        return () => {
            stopScrolling(false);
            revokePreviewUrls(imagesRef.current);
        };
    }, []);

    const handleImagePreviews = async (event) => {
        const files = event.target.files;
        if (!files?.length || form.processing) return;
        setIsUploading(true);
        setLimitMessage('');

        try {
            const { entries, rejected } = await buildImageEntries(files, selectedImages.length);
            setSelectedImages((prev) => [...prev, ...entries]);
            if (rejected > 0) {
                setLimitMessage(`You can upload up to ${MAX_POST_IMAGES} images per post.`);
            }
        } catch (error) {
            console.error('Failed to process images', error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const removeImage = useMemo(
        () => createImageRemovalHandler({
            revokePreviewUrls,
            updateNewImages: setSelectedImages,
        }),
        [createImageRemovalHandler, revokePreviewUrls]
    );

    const resetForm = () => {
        revokePreviewUrls(imagesRef.current);
        setSelectedImages([]);
        setLimitMessage('');
        form.reset();
        form.clearErrors();
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (!canSubmit || form.processing || isUploading) return;

        form.transform((data) => ({
            ...data,
            images: selectedImages.map(({ file }) => file),
        }));

        form.post('/posts/store/post', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const hasImages = selectedImages.length > 0;
    const canSubmit = !!form.data.description.trim() || hasImages;

    return (
        <PostModalShell
            user={user}
            title="Create post"
            onClose={handleClose}
            showLoader={form.processing}
            loaderMessage="Publishing post..."
            footer={
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <PostMediaPicker
                            id="create-post-media"
                            onChange={handleImagePreviews}
                            disabled={form.processing}
                        />
                        <p className="text-xs text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/60">
                            {selectedImages.length}/{MAX_POST_IMAGES} images selected
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
                        {form.processing ? 'Posting...' : 'Post'}
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
                images={selectedImages}
                onRemove={removeImage}
                isLoading={isUploading}
            />
            <InputError message={limitMessage || form.errors.images} />
        </PostModalShell>
    );
};

export default CreatePostModal;