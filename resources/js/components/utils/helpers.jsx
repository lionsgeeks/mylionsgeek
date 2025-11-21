import { router } from "@inertiajs/react";
import imageCompression from 'browser-image-compression';

export const MAX_POST_IMAGES = 16;

const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1500,
    useWebWorker: true,
};

const generateLocalId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

export const helpers = () => {
    const addOrRemoveFollow = (userId, isFollowing) => {
        if (isFollowing) {
            try {
                router.delete(`/users/unfollow/${userId}`, {}, {
                    onSuccess: () => {
                        console.log('you are now unfollow');
                    }
                })
            } catch (error) {
                console.log('unfollow error : ' + error);
            }
        } else {
            try {
                router.post(`/users/follow/${userId}`, {}, {
                    onSuccess: () => {
                        // console.log('you are now follow');
                    }
                })
            } catch (error) {
                // console.log('Follow error : ' + error);
            }
        }
    }

    let scrollY = 0;

    const stopScrolling = (isOpen) => {
        if (isOpen) {
            scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        }
    };

    const mapExistingImages = (images = []) =>
        (images || []).map((image) => ({
            id: image,
            name: image,
            preview: image?.startsWith('http') ? image : `/storage/img/posts/${image}`,
            kind: 'existing',
        }));

    const revokePreviewUrls = (images = []) => {
        images?.forEach((image) => {
            if (image?.kind === 'new' && image.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(image.preview);
            }
        });
    };

    const buildImageEntries = async (fileList, currentCount = 0) => {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return { entries: [], rejected: 0 };
        }

        const availableSlots = Math.max(MAX_POST_IMAGES - currentCount, 0);
        if (availableSlots === 0) {
            return { entries: [], rejected: files.length };
        }

        const allowedFiles = files.slice(0, availableSlots);
        const rejected = files.length - allowedFiles.length;

        const compressedFiles = await Promise.all(
            allowedFiles.map((file) => imageCompression(file, compressionOptions))
        );

        const entries = compressedFiles.map((file) => ({
            id: generateLocalId(),
            file,
            preview: URL.createObjectURL(file),
            kind: 'new',
        }));

        return { entries, rejected };
    };

    return {
        addOrRemoveFollow,
        stopScrolling,
        mapExistingImages,
        revokePreviewUrls,
        buildImageEntries,
    }
}
