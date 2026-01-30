export const TableRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-6 rounded"></div>
                <div className="skeleton h-6 w-8 rounded"></div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-full"></div>
                <div className="space-y-2">
                    <div className="skeleton h-4 w-24 rounded"></div>
                    <div className="skeleton h-3 w-16 rounded"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="skeleton h-6 w-16 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
            <div className="skeleton h-6 w-16 rounded-full"></div>
        </td>

        <td className="px-6 py-4">
            <div className="skeleton h-6 w-20 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
            <div className="skeleton h-6 w-16 rounded-full"></div>
        </td>
    </tr>
);

export const PodiumSkeleton = () => {
    // Podium order: 2nd (left), 1st (middle, tallest), 3rd (right)
    const podiumHeights = { 1: 'h-[220px]', 2: 'h-[180px]', 3: 'h-[140px]' };
    return (
        <div className="mx-auto flex max-w-5xl animate-pulse items-end justify-center gap-6">
            {[2, 1, 3].map((rank, idx) => (
                <div key={idx} className="flex cursor-default flex-col items-center lg:hidden">
                    {/* Avatar placeholder */}
                    <div className="mb-3 flex h-20 w-20 rounded-full bg-gray-300 lg:hidden dark:bg-gray-700" /> {/* Name placeholder */}
                    <div className="mb-2 flex h-4 w-24 rounded bg-gray-300 lg:hidden dark:bg-gray-700" /> {/* Podium block */}
                    <div className={`w-28 ${podiumHeights[rank]} flex rounded-t-lg bg-gray-200 lg:hidden dark:bg-gray-600`} />{' '}
                </div>
            ))}
            {[2, 1, 3].map((rank, idx) => (
                <div key={idx} className="hidden cursor-default flex-col items-center lg:flex">
                    {/* Avatar placeholder */}
                    <div className={`w-72 ${podiumHeights[rank]} rounded-lg bg-gray-200 dark:bg-gray-600`} />{' '}
                </div>
            ))}
        </div>
    );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    return <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>;
};

export const LoadingOverlay = ({ message = 'Loading...' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alpha/20 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-2xl dark:bg-alpha">
            <LoadingSpinner size="xl" />
            <p className="font-medium text-gray-600 dark:text-gray-300">{message}</p>
        </div>
    </div>
);
