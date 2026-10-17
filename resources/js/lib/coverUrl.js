/** Public URL for a user cover stored as a filename, "img/cover/<file>", or an absolute URL. */
export function coverPublicUrl(cover) {
    if (!cover || typeof cover !== 'string') {
        return null;
    }

    const value = cover.trim();
    if (!value) {
        return null;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    const clean = value.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) {
        return `/${clean}`;
    }

    if (!clean.includes('/')) {
        return `/storage/img/cover/${clean}`;
    }

    return `/storage/${clean}`;
}
