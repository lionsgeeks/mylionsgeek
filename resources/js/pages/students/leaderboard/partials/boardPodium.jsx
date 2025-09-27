
import React from "react";
import { PodiumSkeleton } from "@/components/LoadingSkeleton";
import { CrownIcon, MedalIcon, AwardIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";

const BoardPodium = ({
    topWinners,
    isRefreshing,
    fetchLeaderboardData,
    getRankBadge,
    formatTime,
}) => {
    const getInitials = useInitials();

    const handleUserClick = (user) => {
        console.log("Clicked user:", user);
    };

    const podiumRanks = [0, 1, 2]; // 2nd, 1st, 3rd (index in topWinners)

    return (
        <>
            {topWinners.length > 0 && (
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-alpha mb-2">🏆 Week Geeks 🏆</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Top performers this week
                        </p>
                    </div>

                    {isRefreshing ? (
                        <PodiumSkeleton
                            fetchLeaderboardData={fetchLeaderboardData}
                            isRefreshing={isRefreshing}
                        />
                    ) : (
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 max-w-6xl mx-auto">
                            {podiumRanks.map((rankIndex, idx) => {
                                const winner = topWinners[rankIndex];
                                if (!winner) return null;

                                const rank = idx + 1;

                                // Decide styles based on rank
                                {/* const cardHeight =
                                    rank === 1 ? "h-[320px]" : rank === 2 ? "h-[280px]" : "h-[240px]"; */}
                                const bgStyle =
                                    rank === 1
                                        ? "bg-gradient-to-br from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10"
                                        : "bg-white/80 dark:bg-dark/80 backdrop-blur-sm";

                                // Decide icon
                                const icon =
                                    rank === 1 ? (
                                        <CrownIcon className="w-8 h-8 text-white" />
                                    ) : rank === 2 ? (
                                        <MedalIcon className="w-6 h-6 text-white" />
                                    ) : (
                                        <AwardIcon className="w-6 h-6 text-white" />
                                    );

                                const iconWrapper =
                                    rank === 1
                                        ? "w-16 h-16 bg-alpha rounded-full flex items-center justify-center shadow-2xl animate-pulse"
                                        : rank === 2
                                            ? "w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg"
                                            : "w-12 h-12 bg-alpha/80 rounded-full flex items-center justify-center shadow-lg";

                                return (
                                    <div
                                        key={idx}
                                        className={`w-full sm:w-80 ${bgStyle} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group relative border border-alpha/20 dark:border-alpha/30 ${rank === 1
                                            ? "order-first sm:order-none shadow-2xl hover:shadow-3xl hover:scale-110"
                                            : ""
                                            }`}
                                        onClick={() => handleUserClick(winner)}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`absolute ${rank === 1 ? "-top-6" : "-top-4"
                                                } left-1/2 transform -translate-x-1/2 z-10`}
                                        >
                                            <div className={iconWrapper}>{icon}</div>
                                        </div>

                                        {/* Rank */}
                                        <div
                                            className={`text-center mb-4 ${rank === 1 ? "pt-6" : "pt-4"
                                                }`}
                                        >
                                            <div
                                                className={`font-bold mb-2 ${rank === 1
                                                    ? "text-5xl text-alpha"
                                                    : rank === 2
                                                        ? "text-4xl text-gray-600 dark:text-gray-400"
                                                        : "text-4xl text-alpha"
                                                    }`}
                                            >
                                                {rank}
                                            </div>

                                        </div>

                                        {/* Avatar */}
                                        <div className="text-center mb-4 flex justify-center">
                                            <Avatar className="h-26 w-26 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={winner.user?.image}
                                                    alt={winner.user?.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(winner.user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Name */}
                                        <div className="text-center mb-4">
                                            <h3
                                                className={`font-bold text-gray-900 dark:text-white ${rank === 1 ? "text-xl" : "text-lg"
                                                    } mb-1`}
                                            >
                                                {winner.user?.name || "Unknown"}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {winner.user?.promo
                                                    ? `Promo ${winner.user.promo}`
                                                    : "No Promo"}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-center">
                                            <div
                                                className={`font-bold ${rank === 1 ? "text-xl" : "text-lg"
                                                    } text-alpha`}
                                            >
                                                {formatTime(winner.data?.data?.total_seconds || 0)}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default BoardPodium;

