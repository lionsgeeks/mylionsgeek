import { router } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';

export const MAX_POST_IMAGES = 16;

const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1500,
    useWebWorker: true,
};

const generateLocalId = () => `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

const normalizePostImagePath = (rawPath = '') => {
    if (!rawPath) {
        return null;
    }

    const value = String(rawPath).trim();

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    let sanitized = value.replace(/^\/+/, '');

    if (sanitized.startsWith('storage/')) {
        return `/${sanitized}`;
    }

    if (sanitized.startsWith('img/posts')) {
        return `/storage/${sanitized}`;
    }

    if (sanitized.startsWith('public/')) {
        sanitized = sanitized.replace(/^public\//, '');
    }

    if (sanitized.startsWith('storage/img/posts')) {
        return `/${sanitized}`;
    }

    return `/storage/img/posts/${sanitized}`;
};
const addOrRemoveFollow = (userId, isFollowing) => {
    if (isFollowing) {
        try {
            router.delete(
                `/students/unfollow/${userId}`,
                {},
                {
                    onSuccess: () => {
                        //console.log('you are now unfollow');
                    },
                },
            );
        } catch (error) {
            //console.log('unfollow error : ' + error);
        }
    } else {
        try {
            router.post(
                `/students/follow/${userId}`,
                {},
                {
                    onSuccess: () => {
                        // //console.log('you are now follow');
                    },
                },
            );
        } catch (error) {
            // //console.log('Follow error : ' + error);
        }
    }
};

let scrollY = 0;

const stopScrolling = (isOpen) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

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

const resolvePostImageUrl = (image) => {
    if (!image) {
        return null;
    }

    if (typeof image === 'string') {
        return normalizePostImagePath(image);
    }

    if (typeof image === 'object') {
        const candidate = image?.preview || image?.path || image?.url || image?.id;
        return normalizePostImagePath(candidate);
    }

    return null;
};

const mapExistingImages = (images = []) =>
    (images || []).map((image) => {
        const normalizedId = typeof image === 'string' ? image : image?.id || image?.path || image?.name || generateLocalId();

        return {
            id: normalizedId,
            name: typeof image === 'string' ? image : image?.name || normalizedId,
            preview: resolvePostImageUrl(image),
            kind: 'existing',
        };
    });

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

    const compressedFiles = await Promise.all(allowedFiles.map((file) => imageCompression(file, compressionOptions)));

    const entries = compressedFiles.map((file) => ({
        id: generateLocalId(),
        file,
        preview: URL.createObjectURL(file),
        kind: 'new',
    }));

    return { entries, rejected };
};

const removeImageEntry = (image, { revokePreviewUrls: revoke, updateExistingImages, updateNewImages, trackRemovedImage } = {}) => {
    if (!image) {
        return;
    }

    const kind = image.kind ?? 'existing';

    const safeRevoke = (items) => {
        if (typeof revoke === 'function') {
            revoke(items);
        }
    };

    if (kind === 'existing') {
        updateExistingImages?.((prev) => prev.filter((img) => img.id !== image.id));
        trackRemovedImage?.((prev) => (prev.includes(image.id) ? prev : [...prev, image.id]));
        return;
    }

    if (kind === 'new') {
        safeRevoke([image]);
        updateNewImages?.((prev) => prev.filter((img) => img.id !== image.id));
        return;
    }

    safeRevoke([image]);
    updateNewImages?.((prev) => prev.filter((img) => img.id !== image.id));
};

const createImageRemovalHandler =
    (options = {}) =>
    (image) => {
        removeImageEntry(image, options);
    };
const calculateDuration = (parent) => {
    const startDate = new Date(parent?.start_year, parent?.start_month - 1);
    const endDate = parent?.end_year ? new Date(parent?.end_year, parent?.end_month - 1) : new Date(); // Present

    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

    if (months < 0) return '0 mos';

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let result = [];
    if (years) result.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (remainingMonths) result.push(`${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`);

    return result.join(' ');
};

const helperApi = Object.freeze({
    addOrRemoveFollow,
    stopScrolling,
    mapExistingImages,
    revokePreviewUrls,
    buildImageEntries,
    removeImageEntry,
    resolvePostImageUrl,
    calculateDuration,
    createImageRemovalHandler,
});

export const helpers = () => helperApi;
