
import React from "react";
import { PodiumSkeleton } from "@/components/LoadingSkeleton";
import { CrownIcon, MedalIcon, AwardIcon } from "lucide-react";
import { Avatar,  } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";

const BoardPodium = ({
    topWinners,
    isRefreshing,
    fetchLeaderboardData,
    getRankBadge,
    formatTime,
    handleUserClick
}) => {
    const getInitials = useInitials();


    const podiumRanks = [1, 0, 2]; // 2nd, 1st, 3rd (index in topWinners)

    return (
        <>
            {topWinners.length > 0 && (
                <div className="mb-6">
                    {/* <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-alpha mb-2">🏆 Week Geeks 🏆</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Top performers this week
                        </p>
                    </div> */}

                    {isRefreshing ? (
                        <PodiumSkeleton
                            fetchLeaderboardData={fetchLeaderboardData}
                            isRefreshing={isRefreshing}
                        />
                    ) : (
                        <>
                            {/* Laptop Podium */}
                            <div className="relative hidden  lg:flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 max-w-6xl mx-auto">
                                {podiumRanks.map((rankIndex, idx) => {
                                    const winner = topWinners[rankIndex];
                                    if (!winner) return null;

                                    const rank = idx + 1;

                                    // Decide styles based on rank
                                    const cardHeight =
                                        rank === 2 ? "h-[320px]" : rank === 1 ? "h-[280px]" : "h-[240px]";
                                    const bgStyle =
                                        rank === 2
                                            ? "bg-gradient-to-br from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10"
                                            : "bg-white/80 dark:bg-dark/80 backdrop-blur-sm";

                                    // Decide icon
                                    const icon =
                                        rank === 2 ? (
                                            <CrownIcon className="w-8 h-8 text-amber-900" />
                                        ) : rank === 1 ? (
                                            <MedalIcon className="w-6 h-6 text-white" />
                                        ) : (
                                            <AwardIcon className="w-6 h-6 text-white" />
                                        );

                                    const iconWrapper =
                                        rank === 2
                                            ? "w-16 h-16 bg-alpha rounded-full flex items-center justify-center shadow-2xl animate-pulse"
                                            : rank === 1
                                                ? "w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-500 rounded-full flex items-center justify-center shadow-lg"
                                                : "w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center shadow-lg";

                                    return (
                                        <div
                                            key={idx}
                                            className={`w-full sm:w-80 ${bgStyle} ${cardHeight} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group relative border border-alpha/20 dark:border-alpha/30 ${rank === 1
                                                ? "order-first sm:order-none shadow-2xl hover:shadow-3xl hover:scale-110"
                                                : ""
                                                }`}
                                            onClick={() => handleUserClick(winner)}
                                        >
                                            {/* Icon */}
                                            <div
                                                className={`absolute ${rank === 2 ? "-top-6" : "-top-4"
                                                    } left-1/2 transform -translate-x-1/2 z-10`}
                                            >
                                                <div className={iconWrapper}>{icon}</div>
                                            </div>

                                            {/* Rank */}
                                            <div
                                                className={`text-center mb-4 ${rank === 2 ? "pt-10" : rank == 1 ? "pt-10" : "pt-2"
                                                    }`}
                                            >
                                                <div
                                                    className={`font-bold ${rank === 2 ? "text-2xl text-alpha" : "text-lg text-alpha/95"
                                                        } `}
                                                >
                                                    {formatTime(winner.data?.data?.total_seconds)}
                                                </div>

                                            </div>
                                            <div className="">

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
                                                {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {winner.user?.promo
                                                    ? `Promo ${winner.user.promo}`
                                                    : "No Promo"}
                                            </p> */}
                                            </div>
                                            </div>



                                            {/* Stats */}
                                            {/* <div className="text-center">
                                                <div
                                                    className={`font-bold ${rank === 2 ? "text-2xl text-alpha" : "text-lg text-alpha/95"
                                                        } `}
                                                >
                                                    {formatTime(winner.data?.data?.total_seconds)}
                                                </div>

                                            </div> */}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Mobile Podium - Olympic Style */}
                            <div className="flex lg:hidden justify-center items-end gap-3 sm:gap-4 max-w-5xl mx-auto px-4">
                                {podiumRanks.map((rankIndex, idx) => {
                                    const winner = topWinners[rankIndex];
                                    if (!winner) return null;

                                    const rank = idx + 1;
                                    const isWinner = rank === 2;
                                    const isSecond = rank === 1;
                                    const isThird = rank === 3;

                                    // Olympic podium heights: 1st (center, highest), 2nd (left, medium), 3rd (right, lowest)
                                    const podiumHeights = { 
                                        2: "h-[200px] sm:h-[220px]", // Winner - highest
                                        1: "h-[160px] sm:h-[180px]", // Second - medium  
                                        3: "h-[120px] sm:h-[140px]"  // Third - lowest
                                    };

                                    // Distinct colors for each rank
                                    const bgStyle = isWinner
                                        ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/50"
                                        : isSecond
                                            ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-gray-400/50"
                                            : "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-amber-600/50";

                                    // Icons for each rank
                                    const icon = isWinner ? (
                                        <CrownIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                                    ) : isSecond ? (
                                        <MedalIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                                    ) : (
                                        <AwardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                                    );

                                    return (
                                        <div key={idx} className="flex flex-col items-center cursor-pointer group" onClick={() => handleUserClick(winner)}>
                                            {/* Rank badge */}
                                            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10 ${
                                                isWinner ? 'bg-yellow-500 text-white' :
                                                isSecond ? 'bg-gray-400 text-white' :
                                                'bg-amber-600 text-white'
                                            }`}>
                                                {rank}
                                            </div>

                                            {/* Avatar with ring */}
                                            <div className={`relative mb-3 ${isWinner ? 'z-10' : ''}`}>
                                                <Avatar className={`${isWinner ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-16 w-16 sm:h-20 sm:w-20'} ring-4 ring-white/80 shadow-xl`}>
                                                    <AvatarImage src={winner.user?.image} alt={winner.user?.name} />
                                                    <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-lg font-bold">
                                                        {getInitials(winner.user?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            {/* Name and time */}
                                            <div className="text-center mb-3 max-w-24">
                                                <div className={`font-bold truncate ${isWinner ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} mb-1`} title={winner.user?.name || "Unknown"}>
                                                    {winner.user?.name || "Unknown"}
                                                </div>
                                                <div className={`text-xs sm:text-sm font-semibold ${isWinner ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {formatTime(winner.data?.data?.total_seconds)}
                                                </div>
                                            </div>

                                            {/* Podium block with icon */}
                                            <div className={`w-20 sm:w-24 ${podiumHeights[rank]} ${bgStyle} rounded-t-xl flex flex-col items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 relative overflow-hidden`}>
                                                {/* Shine effect */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-t-xl"></div>
                                                
                                                {/* Icon */}
                                                <div className="relative z-10">
                                                    {icon}
                                                </div>
                                                
                                                {/* Rank number on podium */}
                                                <div className=" bottom-2 right-2 text-white/80 font-bold text-lg">
                                                    {rank ==2 ? 1 : rank == 1 ? 2 : 3}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default BoardPodium;

