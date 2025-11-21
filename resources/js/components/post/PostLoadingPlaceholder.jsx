import React from 'react';

const shimmer = 'animate-pulse bg-gradient-to-r from-gray-200/60 via-gray-100/60 to-gray-200/60 dark:from-dark_gray/30 dark:via-dark_gray/20 dark:to-dark_gray/30';

const PostLoadingPlaceholder = ({ variant = 'create' }) => {
    const message = variant === 'edit' ? 'Updating post...' : 'Posting...';

    return (
        <div className="bg-white dark:bg-dark_gray rounded-lg shadow mb-4 border border-gray-100/40 dark:border-dark_gray/40 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full ${shimmer}`} />
                <div className="flex-1">
                    <div className={`h-4 w-32 rounded-full mb-2 ${shimmer}`} />
                    <div className={`h-3 w-24 rounded-full ${shimmer}`} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{message}</span>
            </div>
            <div className="px-4 pb-4 space-y-2">
                <div className={`h-3 w-full rounded ${shimmer}`} />
                <div className={`h-3 w-10/12 rounded ${shimmer}`} />
                <div className={`h-3 w-8/12 rounded ${shimmer}`} />
            </div>
        </div>
    );
};

export default PostLoadingPlaceholder;

