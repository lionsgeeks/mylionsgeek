import { AlertCircle, Search, Users } from 'lucide-react';

export const NoResults = ({ searchText = '', onClearSearch, onRefresh, type = 'search', message = null }) => {
    const getContent = () => {
        switch (type) {
            case 'search':
                return {
                    icon: <Search className="h-16 w-16 text-gray-400" />,
                    title: searchText ? `No results for "${searchText}"` : 'No data available',
                    subtitle: searchText ? 'Try adjusting your search terms' : 'No leaderboard data found',
                    actions: [
                        { label: 'Clear Search', onClick: onClearSearch, variant: 'secondary' },
                        { label: 'Refresh Data', onClick: onRefresh, variant: 'primary' },
                    ],
                };
            case 'error':
                return {
                    icon: <AlertCircle className="h-16 w-16 text-red-400" />,
                    title: 'Something went wrong',
                    subtitle: 'Unable to load leaderboard data',
                    actions: [{ label: 'Try Again', onClick: onRefresh, variant: 'primary' }],
                };
            case 'empty':
                return {
                    icon: <Users className="h-16 w-16 text-gray-400" />,
                    title: 'No active coders',
                    subtitle: 'Be the first to join the leaderboard!',
                    actions: [{ label: 'Refresh', onClick: onRefresh, variant: 'primary' }],
                };
            default:
                return {
                    icon: <Search className="h-16 w-16 text-gray-400" />,
                    title: message || 'No results found',
                    subtitle: 'Try adjusting your filters or search terms',
                    actions: [
                        { label: 'Clear Filters', onClick: onClearSearch, variant: 'secondary' },
                        { label: 'Refresh', onClick: onRefresh, variant: 'primary' },
                    ],
                };
        }
    };

    const content = getContent();

    return (
        <div className="flex flex-col items-center justify-center px-4 py-16">
            <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    {content.icon}
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-alpha/80 to-alpha">
                    <span className="text-sm font-bold text-black">?</span>
                </div>
            </div>

            <div className="max-w-md text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h3>
                <p className="mb-8 text-gray-600 dark:text-gray-400">{content.subtitle}</p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    {content.actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                                action.variant === 'primary'
                                    ? 'transform bg-gradient-to-r from-alpha/90 to-alpha text-black shadow-lg hover:scale-105 hover:from-alpha hover:to-amber-500 hover:shadow-xl'
                                    : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
