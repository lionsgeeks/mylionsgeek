const shimmer =
    'animate-pulse bg-gradient-to-r from-gray-200/60 via-gray-100/60 to-gray-200/60 dark:from-dark_gray/30 dark:via-dark_gray/20 dark:to-dark_gray/30';

const PostLoadingPlaceholder = ({ variant = 'create' }) => {
    const message = variant === 'edit' ? 'Updating post...' : 'Posting...';

    return (
        <div className="mb-4 overflow-hidden rounded-lg border border-gray-100/40 bg-white shadow dark:border-dark_gray/40 dark:bg-dark_gray">
            <div className="flex items-center gap-3 p-4">
                <div className={`h-12 w-12 rounded-full ${shimmer}`} />
                <div className="flex-1">
                    <div className={`mb-2 h-4 w-32 rounded-full ${shimmer}`} />
                    <div className={`h-3 w-24 rounded-full ${shimmer}`} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{message}</span>
            </div>
            <div className="space-y-2 px-4 pb-4">
                <div className={`h-3 w-full rounded ${shimmer}`} />
                <div className={`h-3 w-10/12 rounded ${shimmer}`} />
                <div className={`h-3 w-8/12 rounded ${shimmer}`} />
            </div>
        </div>
    );
};

export default PostLoadingPlaceholder;
