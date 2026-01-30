import { Award, Calendar, RefreshCw, Search } from 'lucide-react';

const BoardFilter = ({
    filter,
    selectedPromo,
    setSelectedPromo,
    availablePromos,
    searchText,
    setSearchText,
    leaderboardData,
    isRefreshing,
    setFilter,
}) => {
    return (
        <>
            {/* Enhanced Filters Section */}
            <div className="mb-8 rounded-2xl border border-alpha/20 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-alpha/30 dark:bg-dark/80">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Time Range Filter */}
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="rounded-xl border border-alpha/20 bg-white py-3 pr-8 pl-10 text-dark shadow-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-alpha dark:border-alpha/30 dark:bg-dark_gray dark:text-light"
                            >
                                <option value="alltime">All Time</option>
                                <option value="this_week">This week</option>
                                <option value="month">This Month</option>
                                <option value="week">Last 7 Days</option>
                                {/* <option value="daily">Today</option> */}
                            </select>
                        </div>

                        {/* Promo Filter */}
                        <div className="relative">
                            <Award className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                            <select
                                value={selectedPromo}
                                onChange={(e) => setSelectedPromo(e.target.value)}
                                className="rounded-xl border border-alpha/20 bg-white py-3 pr-8 pl-10 text-dark shadow-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-alpha dark:border-alpha/30 dark:bg-dark_gray dark:text-light"
                            >
                                <option value="all">All Promotions</option>
                                {availablePromos.map((promo) => (
                                    <option key={promo} value={promo}>
                                        Promo {promo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-64 rounded-xl border border-alpha/20 bg-white py-3 pr-4 pl-10 text-dark shadow-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-alpha dark:border-alpha/30 dark:bg-dark_gray dark:text-light"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isRefreshing && <div className="text-sm text-gray-600 dark:text-gray-400">{leaderboardData.length} coders</div>}
                        <div className="flex items-center gap-2 text-sm text-dark/70 dark:text-light/70">
                            {isRefreshing ? (
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            ) : (
                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                            )}
                            <span>{isRefreshing ? 'Updating...' : 'Live'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardFilter;
