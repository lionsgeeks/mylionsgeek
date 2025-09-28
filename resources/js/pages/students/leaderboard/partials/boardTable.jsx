import { Activity, Award, Calendar, Clock, Code, Laptop, Medal, Monitor, RefreshCw, Star, TrendingUp, Trophy, X } from 'lucide-react';
import React from 'react';
import { TableRowSkeleton } from '@/components/LoadingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";


const BoardTable = ({ isRefreshing, leaderboardData, NoResults, searchText, fetchLeaderboardData, showSidePanel, getRankIcon, highlightText, selectedUser, formatTime, userInsights, loadingInsights, closeSidePanel, getRankBadge, handleUserClick, getRankColor }) => {
    const getInitials = useInitials();

    return (
        <>
            {/* Enhanced Leaderboard Table */}
            <div className="w-full">
                <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl shadow-xl border border-alpha/20 dark:border-alpha/30 overflow-hidden">
                    {/* <div className="px-6 py-5 border-b border-alpha/20 dark:border-alpha/30">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-dark dark:text-light">Leaderboard</h3>
                            <div className="flex items-center gap-2 text-sm text-dark/70 dark:text-light/70">
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{isRefreshing ? 'Updating...' : 'Live'}</span>
                            </div>
                        </div>
                    </div> */}

                    <div className="overflow-x-auto lg:overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Place</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Player Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Total Time</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Daily Avg</th>
                                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Consistency</th> */}
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Top Language</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Rank</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-alpha/20 dark:divide-alpha/20">
                                {isRefreshing ? (
                                    <>
                                        {[...Array(5)].map((_, index) => (
                                            <TableRowSkeleton key={index} />
                                        ))}
                                    </>
                                ) : leaderboardData.length > 0 ? (
                                    leaderboardData.map((user, index) => (
                                        <tr
                                            key={user.user?.id || index}
                                            className={`hover:bg-alpha/5 ${index == 0 && "bg-alpha/5"} dark:hover:bg-alpha/5 transition-all duration-200 cursor-pointer group table-row`}
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {getRankIcon(user.metrics?.rank || index + 1)}
                                                    {/* <span className="text-lg font-bold text-dark dark:text-light">
                                                        {user.metrics?.rank || index + 1}
                                                    </span> */}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-14 w-14 overflow-hidden rounded-full">
                                                        <AvatarImage
                                                            src={user?.user?.image}
                                                            alt={user?.user?.name}
                                                        />
                                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                            {getInitials(user?.user?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div
                                                            className="font-semibold text-dark dark:text-light text-lg"
                                                            dangerouslySetInnerHTML={{
                                                                __html: highlightText(user.user?.name || 'Unknown', searchText)
                                                            }}
                                                        />
                                                        <div className="text-sm text-dark/70 dark:text-light/70">
                                                            {user.user?.promo ? `Promo ${user.user.promo}` : 'No Promo'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 shadow-sm">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(user.data?.total_seconds || 0)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-200 shadow-sm">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {formatTime(user.data?.daily_average || 0)}
                                                </span>
                                            </td>

                                            {/* <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 progress-container bg-light/50 dark:bg-dark/50 h-3 shadow-inner">
                                                        <div
                                                            className="h-3 progress-fill bg-gradient-to-r from-alpha to-alpha/80"
                                                            style={{ width: `${Math.min(100, user.metrics?.win_rate || 0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-dark dark:text-light min-w-[3rem]">
                                                        {user.metrics?.win_rate || 0}%
                                                    </span>
                                                </div>
                                            </td> */}

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-alpha/20 text-alpha shadow-sm">
                                                    <Code className="w-4 h-4" />
                                                    {user.data?.languages?.[0]?.name || 'N/A'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm rank-badge ${getRankColor(user.metrics?.rank || index + 1)}`}>
                                                    <Star className="w-4 h-4" />
                                                    {getRankBadge(user.data?.total_seconds)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-0">
                                            <NoResults
                                                searchText={searchText}
                                                onClearSearch={() => setSearchText('')}
                                                onRefresh={fetchLeaderboardData}
                                                type={searchText ? 'search' : 'empty'}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Backdrop Overlay */}
            {showSidePanel && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidePanel}
                ></div>
            )}

            {/* Fixed Side Panel for User Details */}
            {showSidePanel && selectedUser && (
                <div className="">

                    <div onClick={closeSidePanel} className="bg-black/40 w-screen h-screen fixed top-0 left-0"></div>
                    <div className="fixed h-[95%] rounded-lg my-auto  inset-y-0 right-0 w-[25vw] z-50 bg-white/95 dark:bg-dark/95 backdrop-blur-lg shadow-2xl border-l border-alpha/20 dark:border-alpha/30  slide-in-right">
                        <div className="h-full overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-dark dark:text-light">Profile Details</h3>
                                <button
                                    onClick={closeSidePanel}
                                    className="p-2 hover:bg-alpha/10 dark:hover:bg-alpha/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-dark/70 dark:text-light/70" />
                                </button>
                            </div>

                            {/* User Header */}
                            <div className="text-center mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-r from-alpha to-alpha/80 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                        <Avatar className="h-full w-full overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={selectedUser?.user?.image}
                                                alt={selectedUser?.user?.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(selectedUser?.user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    {selectedUser.metrics?.rank <= 3 && (
                                        <div className="absolute -top-2 -right-2">
                                            {selectedUser.metrics.rank === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
                                            {selectedUser.metrics.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                                            {selectedUser.metrics.rank === 3 && <Award className="w-6 h-6 text-amber-600" />}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xl font-semibold text-dark dark:text-light">
                                    {selectedUser.user?.name || 'Unknown'}
                                </h4>
                                <p className="text-dark/70 dark:text-light/70">
                                    {selectedUser.user?.promo ? `Promo ${selectedUser.user.promo}` : 'No Promo'}
                                </p>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRankColor(selectedUser.metrics?.rank || 1)}`}>
                                        <Star className="w-4 h-4" />
                                        {getRankBadge(selectedUser.data?.total_seconds  || 1)}
                                    </span>
                                    <span className="text-xs text-dark/50 dark:text-light/50">
                                        #{selectedUser.metrics?.rank || 1}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                                    <div className="text-sm text-dark/70 dark:text-light/70">Total Time</div>
                                    <div className="text-lg font-semibold text-dark dark:text-light">
                                        {formatTime(selectedUser.data?.total_seconds || 0)}
                                    </div>
                                </div>
                                <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                                    <div className="text-sm text-dark/70 dark:text-light/70">Daily Average</div>
                                    <div className="text-lg font-semibold text-dark dark:text-light">
                                        {formatTime(selectedUser.data?.daily_average || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mb-6">
                                <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Top Languages</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.data?.languages?.slice(0, 4).map((lang, index) => (
                                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-alpha/20 to-alpha/10 text-alpha rounded-full text-sm font-medium">
                                            {lang.name}
                                        </span>
                                    )) || <span className="text-dark/50 dark:text-light/50">No data</span>}
                                </div>
                            </div>

                            {/* Consistency */}
                            <div className="mb-6">
                                <div className="text-sm text-dark/70 dark:text-light/70 mb-2">Consistency</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-light/50 dark:bg-dark/50 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-alpha to-alpha/80 progress-bar"
                                            style={{ width: `${Math.min(100, selectedUser.metrics?.win_rate || 0)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-dark dark:text-light">
                                        {selectedUser.metrics?.win_rate || 0}%
                                    </span>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="mb-6">
                                <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Achievements</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-r from-alpha/10 to-alpha/5 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-alpha">{selectedUser.metrics?.languages_count || 0}</div>
                                        <div className="text-xs text-dark/70 dark:text-light/70">Languages</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">{Math.round(selectedUser.metrics?.total_hours || 0)}h</div>
                                        <div className="text-xs text-dark/70 dark:text-light/70">Total Hours</div>
                                    </div>
                                </div>
                            </div>

                            {/* Coding Insights */}
                            {loadingInsights ? (
                                <div className="mb-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Loading Insights...</div>
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl animate-pulse">
                                                <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                                <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : userInsights && (
                                <div className="mb-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">Coding Insights</div>
                                    <div className="space-y-4">
                                        {userInsights.bestDay && (
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Best Day</span>
                                                </div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                    {userInsights.bestDay.data?.text || 'No data available'}
                                                </div>
                                            </div>
                                        )}

                                        {userInsights.languages && userInsights.languages.data && (
                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Language Distribution</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {userInsights.languages.data.slice(0, 4).map((lang, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{lang.percent}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userInsights.projects && userInsights.projects.data && (
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Projects</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {userInsights.projects.data.slice(0, 4).map((project, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{project.name}</span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(project.total_seconds)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userInsights.editors && userInsights.editors.data && (
                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Editors</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {userInsights.editors.data.slice(0, 3).map((editor, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{editor.name}</span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(editor.total_seconds)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userInsights.machines && userInsights.machines.data && (
                                            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Laptop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Machines</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {userInsights.machines.data.slice(0, 3).map((machine, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{machine.name}</span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(machine.total_seconds)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Performance Indicators */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-dark/70 dark:text-light/70">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {selectedUser.success ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-dark/70 dark:text-light/70">Member Since</span>
                                    <span className="text-xs text-dark dark:text-light">
                                        {selectedUser.user?.created_at ? new Date(selectedUser.user.created_at).toLocaleDateString() : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BoardTable;