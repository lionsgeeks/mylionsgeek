import { Award, Calendar, Search } from 'lucide-react';
import React from 'react';

const BoardFilter = ({filter , selectedPromo , setSelectedPromo , availablePromos , searchText , setSearchText , leaderboardData}) => {
    return (
        <>

            {/* Enhanced Filters Section */}
            <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl shadow-xl border border-alpha/20 dark:border-alpha/30 p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        {/* Time Range Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 shadow-sm"
                            >
                                <option value="alltime">All Time</option>
                                <option value="month">This Month</option>
                                <option value="week">This Week</option>
                                <option value="daily">Today</option>
                            </select>
                        </div>

                        {/* Promo Filter */}
                        <div className="relative">
                            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                            <select
                                value={selectedPromo}
                                onChange={(e) => setSelectedPromo(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 shadow-sm"
                            >
                                <option value="all">All Promotions</option>
                                {availablePromos.map(promo => (
                                    <option key={promo} value={promo}>Promo {promo}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-10 pr-4 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 w-64 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {leaderboardData.length} coders
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Live Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardFilter;