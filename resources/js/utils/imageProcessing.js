import imageCompression from 'browser-image-compression';

const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1500,
    useWebWorker: true,
};

export const compressFiles = async (fileList = [], options = {}) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) {
        return [];
    }

    const compressionOptions = { ...defaultOptions, ...options };

    return Promise.all(
        files.map((file) => imageCompression(file, compressionOptions))
    );
};

export const generateLocalId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;

