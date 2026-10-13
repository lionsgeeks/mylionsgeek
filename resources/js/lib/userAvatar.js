/**
 * Resolve profile image URL for navbar, settings, etc. (matches storage layout: storage/img/profile/{filename}).
 */
export function resolveUserAvatarSrc(user) {
    if (!user) {
        return undefined;
    }

    if (user.avatarUrl) {
        return user.avatarUrl;
    }

    const raw = user.image;
    if (!raw || typeof raw !== 'string') {
        return undefined;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
        return undefined;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    if (trimmed.startsWith('/storage/')) {
        return trimmed;
    }

    if (trimmed.includes('img/profile/')) {
        return `/storage/${trimmed.replace(/^\/+/, '')}`;
    }

    return `/storage/img/profile/${trimmed.replace(/^\/+/, '')}`;
}
