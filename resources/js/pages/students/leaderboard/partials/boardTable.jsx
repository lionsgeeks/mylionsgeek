import { TableRowSkeleton } from '@/components/LoadingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Activity, Award, Calendar, Clock, Code, Laptop, Medal, Monitor, Star, TrendingUp, Trophy, X } from 'lucide-react';

const BoardTable = ({
    isRefreshing,
    leaderboardData,
    NoResults,
    searchText,
    fetchLeaderboardData,
    showSidePanel,
    getRankIcon,
    highlightText,
    selectedUser,
    formatTime,
    userInsights,
    loadingInsights,
    closeSidePanel,
    getRankBadge,
    handleUserClick,
    getRankColor,
}) => {
    const getInitials = useInitials();

    return (
        <>
            {/* Enhanced Leaderboard Table */}
            <div className="w-full">
                <div className="overflow-hidden rounded-2xl border border-alpha/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-alpha/30 dark:bg-dark/80">
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
                                            className={`hover:bg-alpha/5 ${index == 0 && 'bg-alpha/5'} group table-row cursor-pointer transition-all duration-200 dark:hover:bg-alpha/5`}
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
                                                        <AvatarImage src={user?.user?.image} alt={user?.user?.name} />
                                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                            {getInitials(user?.user?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div
                                                            className="text-lg font-semibold text-dark dark:text-light"
                                                            dangerouslySetInnerHTML={{
                                                                __html: highlightText(user.user?.name || 'Unknown', searchText),
                                                            }}
                                                        />
                                                        <div className="text-sm text-dark/70 dark:text-light/70">
                                                            {user.user?.promo ? `Promo ${user.user.promo}` : 'No Promo'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 text-sm font-semibold text-yellow-800 shadow-sm dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200">
                                                    <Clock className="h-4 w-4" />
                                                    {formatTime(user.data?.total_seconds || 0)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-200">
                                                    <TrendingUp className="h-4 w-4" />
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
                                                <span className="inline-flex items-center gap-2 rounded-xl bg-alpha/20 px-4 py-2 text-sm font-semibold text-alpha shadow-sm">
                                                    <Code className="h-4 w-4" />
                                                    {user.data?.languages?.[0]?.name || 'N/A'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rank-badge inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm ${getRankColor(user.metrics?.rank || index + 1)}`}
                                                >
                                                    <Star className="h-4 w-4" />
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
            {showSidePanel && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={closeSidePanel}></div>}

            {/* Fixed Side Panel for User Details */}
            {showSidePanel && selectedUser && (
                <div className="">
                    <div onClick={closeSidePanel} className="fixed top-0 left-0 h-screen w-screen bg-black/40"></div>
                    <div className="slide-in-right fixed inset-y-0 right-0 z-50 my-auto h-[95%] w-[25vw] rounded-lg border-l border-alpha/20 bg-white/95 shadow-2xl backdrop-blur-lg dark:border-alpha/30 dark:bg-dark/95">
                        <div className="h-full overflow-y-auto p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-dark dark:text-light">Profile Details</h3>
                                <button
                                    onClick={closeSidePanel}
                                    className="rounded-lg p-2 transition-colors hover:bg-alpha/10 dark:hover:bg-alpha/20"
                                >
                                    <X className="h-5 w-5 text-dark/70 dark:text-light/70" />
                                </button>
                            </div>

                            {/* User Header */}
                            <div className="mb-6 text-center">
                                <div className="relative">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-alpha to-alpha/80 text-2xl font-bold text-white">
                                        <Avatar className="h-full w-full overflow-hidden rounded-full">
                                            <AvatarImage src={selectedUser?.user?.image} alt={selectedUser?.user?.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(selectedUser?.user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    {selectedUser.metrics?.rank <= 3 && (
                                        <div className="absolute -top-2 -right-2">
                                            {selectedUser.metrics.rank === 1 && <Trophy className="h-6 w-6 text-yellow-500" />}
                                            {selectedUser.metrics.rank === 2 && <Medal className="h-6 w-6 text-gray-400" />}
                                            {selectedUser.metrics.rank === 3 && <Award className="h-6 w-6 text-amber-600" />}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xl font-semibold text-dark dark:text-light">{selectedUser.user?.name || 'Unknown'}</h4>
                                <p className="text-dark/70 dark:text-light/70">
                                    {selectedUser.user?.promo ? `Promo ${selectedUser.user.promo}` : 'No Promo'}
                                </p>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getRankColor(selectedUser.metrics?.rank || 1)}`}
                                    >
                                        <Star className="h-4 w-4" />
                                        {getRankBadge(selectedUser.data?.total_seconds || 1)}
                                    </span>
                                    <span className="text-xs text-dark/50 dark:text-light/50">#{selectedUser.metrics?.rank || 1}</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-alpha/10 p-4 dark:bg-alpha/20">
                                    <div className="text-sm text-dark/70 dark:text-light/70">Total Time</div>
                                    <div className="text-lg font-semibold text-dark dark:text-light">
                                        {formatTime(selectedUser.data?.total_seconds || 0)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-alpha/10 p-4 dark:bg-alpha/20">
                                    <div className="text-sm text-dark/70 dark:text-light/70">Daily Average</div>
                                    <div className="text-lg font-semibold text-dark dark:text-light">
                                        {formatTime(selectedUser.data?.daily_average || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mb-6">
                                <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Top Languages</div>
                                <div className="space-y-2">
                                    {selectedUser.data?.languages?.slice(0, 5).map((lang, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-alpha/10 to-alpha/5 p-2"
                                        >
                                            <span className="text-sm font-medium text-dark dark:text-light">{lang.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 rounded-full bg-light/50 dark:bg-dark/50">
                                                    <div
                                                        className="h-2 rounded-full bg-gradient-to-r from-alpha to-alpha/80"
                                                        style={{ width: `${lang.percent || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="min-w-[3rem] text-xs text-dark/70 dark:text-light/70">{lang.percent || 0}%</span>
                                            </div>
                                        </div>
                                    )) || <span className="text-dark/50 dark:text-light/50">No data</span>}
                                </div>
                            </div>

                            {/* Daily Breakdown */}
                            {selectedUser.data?.daily_breakdown && selectedUser.data.daily_breakdown.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Daily Breakdown</div>
                                    <div className="max-h-32 space-y-2 overflow-y-auto">
                                        {selectedUser.data.daily_breakdown.map((day, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-2 dark:from-green-900/20 dark:to-emerald-900/20"
                                            >
                                                <span className="text-sm font-medium text-dark dark:text-light">
                                                    {new Date(day.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{day.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Consistency */}
                            <div className="mb-6">
                                <div className="mb-2 text-sm text-dark/70 dark:text-light/70">Consistency</div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 flex-1 rounded-full bg-light/50 dark:bg-dark/50">
                                        <div
                                            className="progress-bar h-2 rounded-full bg-gradient-to-r from-alpha to-alpha/80"
                                            style={{ width: `${Math.min(100, selectedUser.metrics?.win_rate || 0)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-dark dark:text-light">{selectedUser.metrics?.win_rate || 0}%</span>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="mb-6">
                                <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Achievements</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-alpha/10 to-alpha/5 p-3 text-center">
                                        <div className="text-2xl font-bold text-alpha">{selectedUser.metrics?.languages_count || 0}</div>
                                        <div className="text-xs text-dark/70 dark:text-light/70">Languages</div>
                                    </div>
                                    <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{Math.round(selectedUser.metrics?.total_hours || 0)}h</div>
                                        <div className="text-xs text-dark/70 dark:text-light/70">Total Hours</div>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            {selectedUser.data?.projects && selectedUser.data.projects.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Top Projects</div>
                                    <div className="space-y-2">
                                        {selectedUser.data.projects.slice(0, 4).map((project, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-2 dark:from-purple-900/20 dark:to-pink-900/20"
                                            >
                                                <span className="mr-2 flex-1 truncate text-sm font-medium text-dark dark:text-light">
                                                    {project.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-12 rounded-full bg-light/50 dark:bg-dark/50">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                            style={{ width: `${project.percent || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="min-w-[2.5rem] text-xs text-dark/70 dark:text-light/70">
                                                        {formatTime(project.total_seconds)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Editors */}
                            {selectedUser.data?.editors && selectedUser.data.editors.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Top Editors</div>
                                    <div className="space-y-2">
                                        {selectedUser.data.editors.slice(0, 3).map((editor, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-2 dark:from-orange-900/20 dark:to-red-900/20"
                                            >
                                                <span className="text-sm font-medium text-dark dark:text-light">{editor.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-12 rounded-full bg-light/50 dark:bg-dark/50">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                                                            style={{ width: `${editor.percent || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="min-w-[2.5rem] text-xs text-dark/70 dark:text-light/70">
                                                        {formatTime(editor.total_seconds)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Machines */}
                            {selectedUser.data?.machines && selectedUser.data.machines.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-3 text-sm text-dark/70 dark:text-light/70">Machines</div>
                                    <div className="space-y-2">
                                        {selectedUser.data.machines.slice(0, 3).map((machine, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 p-2 dark:from-indigo-900/20 dark:to-violet-900/20"
                                            >
                                                <span className="mr-2 flex-1 truncate text-sm font-medium text-dark dark:text-light">
                                                    {machine.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-12 rounded-full bg-light/50 dark:bg-dark/50">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                                            style={{ width: `${machine.percent || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="min-w-[2.5rem] text-xs text-dark/70 dark:text-light/70">
                                                        {formatTime(machine.total_seconds)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coding Insights */}
                            {loadingInsights ? (
                                <div className="mb-6">
                                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">Loading Insights...</div>
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="animate-pulse rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                                                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                userInsights && (
                                    <div className="mb-6">
                                        <div className="mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Coding Insights</div>
                                        <div className="space-y-4">
                                            {userInsights.bestDay && (
                                                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800/30 dark:from-green-900/20 dark:to-emerald-900/20">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Best Day</span>
                                                    </div>
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                        {userInsights.bestDay.data?.text || 'No data available'}
                                                    </div>
                                                </div>
                                            )}

                                            {userInsights.languages && userInsights.languages.data && (
                                                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800/30 dark:from-blue-900/20 dark:to-cyan-900/20">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Language Distribution
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {userInsights.languages.data.slice(0, 4).map((lang, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {lang.percent}%
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {userInsights.projects && userInsights.projects.data && (
                                                <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Projects</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {userInsights.projects.data.slice(0, 4).map((project, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                                                    {project.name}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {formatTime(project.total_seconds)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {userInsights.editors && userInsights.editors.data && (
                                                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-4 dark:border-orange-800/30 dark:from-orange-900/20 dark:to-red-900/20">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Editors</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {userInsights.editors.data.slice(0, 3).map((editor, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{editor.name}</span>
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {formatTime(editor.total_seconds)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {userInsights.machines && userInsights.machines.data && (
                                                <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 dark:border-indigo-800/30 dark:from-indigo-900/20 dark:to-violet-900/20">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Machines</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {userInsights.machines.data.slice(0, 3).map((machine, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                                                    {machine.name}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {formatTime(machine.total_seconds)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Performance Indicators */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-dark/70 dark:text-light/70">Status</span>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            selectedUser.success
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {selectedUser.success ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
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
