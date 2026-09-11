/** Resolve chat/project attachment path to a gated or legacy URL. */
export function resolveAttachmentUrl(path, message = null) {
    if (message?.attachment_url_web) return message.attachment_url_web;
    if (message?.attachment_url) return message.attachment_url;

    if (!path) return '';
    if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('/api/') ||
        path.startsWith('/chat/') ||
        path.startsWith('/admin/') ||
        path.startsWith('blob:')
    ) {
        return path;
    }

    // Legacy public paths only (never private chat/attachments disk).
    if (path.startsWith('/storage/') || path.includes('img/posts/') || path.includes('img/profile/')) {
        return path.startsWith('/') ? path : `/storage/${path}`;
    }

    // Chat private attachments must use authenticated endpoints.
    if (message?.id && (path.includes('chat/attachments') || message.attachment_type)) {
        return `/chat/message/${message.id}/attachment`;
    }

    return path.startsWith('/') ? path : `/storage/${path}`;
}
