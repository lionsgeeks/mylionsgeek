import { Calendar, RefreshCw, Trophy } from 'lucide-react';
import React from 'react';

const BoardHeader = ({ fetchLeaderboardData, isRefreshing , fetchPreviousWeekPodium }) => {
    return (
        <>

            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
                    <div className="flex  gap-4">
                        {/* <div className="p-4 bg-gradient-to-br from-yellow-400 via-alpha to-alpha rounded-2xl shadow-2xl">
                            <Trophy className="w-10 h-10 text-dark" />
                        </div> */}
                        {/* <div className="text-left">
                            <h1 className="text-3xl font-bold text-alpha mb-2">
                                Wakatime Leaderboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-l">Track coding activity and compete with peers</p>
                        </div> */}
                    </div>

                    {/* <div className="flex items-center gap-4">
                        <button
                            onClick={fetchLeaderboardData}
                            disabled={isRefreshing}
                            className="flex items-center gap-3 px-6 py-3 bg-alpha text-dark rounded-xl hover:bg-alpha/80 disabled:opacity-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold"
                        >
                            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div> */}

                    <div className="flex justify-end mb-4">
                        <button
                            onClick={fetchPreviousWeekPodium}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark text-light hover:bg-dark/90 dark:bg-light dark:text-dark dark:hover:bg-light/90 transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
                            Previous week podium
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardHeader;