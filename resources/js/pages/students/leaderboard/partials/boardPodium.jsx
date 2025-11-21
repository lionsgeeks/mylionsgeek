
import React from "react";
import { PodiumSkeleton } from "@/components/LoadingSkeleton";
import { CrownIcon, MedalIcon, AwardIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const BoardPodium = ({
    topWinners,
    isRefreshing,
    fetchLeaderboardData,
    getRankBadge,
    formatTime,
    handleUserClick
}) => {
    const podiumRanks = [1, 0, 2]; // Display order (2nd, 1st, 3rd)

    const podiumConfig = {
        1: {
            baseGradient: "bg-gradient-to-b from-[#f5cc58] via-[#f3a81c] to-[#8f4f05]",
            glow: "shadow-[0_20px_45px_rgba(243,168,28,0.55)]",
            accent: "text-[#ffe3a7]",
            height: "h-[100px] sm:h-[170px]",
            labelColor: "text-[#fce19d]",
            pillBg: "bg-[#2f1a02]/70",
            iconBg: "bg-[#fddc88]/55",
            avatarRing: "ring-4 ring-[#f7c55f]/40",
            offset: "lg:-mt-6",
            bg: "bg-[#fddc88]"
        },
        2: {
            baseGradient: "bg-gradient-to-b from-[#56f2b7] via-[#1a936f] to-[#063329]",
            glow: "shadow-[0_18px_40px_rgba(86,242,183,0.35)]",
            accent: "text-[#9bfad7]",
            height: "h-[110px] sm:h-[150px]",
            labelColor: "text-[#83f0c8]",
            pillBg: "bg-[#052620]/70",
            iconBg: "bg-[#83f0c8]/55",
            avatarRing: "ring-4 ring-[#63f5c5]/30",
            offset: "lg:mt-0",
            bg: "bg-[#83f0c8]"
        },
        3: {
            baseGradient: "bg-gradient-to-b from-[#4fe8ac] via-[#0f7a59] to-[#05251b]",
            glow: "shadow-[0_16px_35px_rgba(79,232,172,0.3)]",
            accent: "text-[#8cf7cf]",
            height: "h-[120px] sm:h-[150px]",
            labelColor: "text-[#79eabf]",
            pillBg: "bg-[#041f19]/70",
            iconBg: "bg-[#8cf7cf]/55",
            avatarRing: "ring-4 ring-[#4fe8ac]/25",
            offset: "lg:mt-4",
            bg: "bg-[#83f0c8]"
        }
    };

    const getIcon = (rank) => {
        if (rank === 1) {
            return <CrownIcon className="w-12 h-12 text-[#fcd575] drop-shadow-[0_0_35px_rgba(252,213,117,0.8)]" />;
        }
        if (rank === 2) {
            return <MedalIcon className="w-10 h-10 text-[#7ef4cc] drop-shadow-[0_0_30px_rgba(126,244,204,0.6)]" />;
        }
        return <AwardIcon className="w-10 h-10 text-[#7ef4cc] drop-shadow-[0_0_30px_rgba(126,244,204,0.6)]" />;
    };

    return (
        <>
            {topWinners.length > 0 && (
                <div className="mb-10">
                    {isRefreshing ? (
                        <PodiumSkeleton
                            fetchLeaderboardData={fetchLeaderboardData}
                            isRefreshing={isRefreshing}
                        />
                    ) : (
                        <div className="relative  px-2 py-20 bg-transparent sm:px-10 overflow-hidden">
                            {/* Podium */}
                            {/* Podium */}
                            <div
                                className="relative z-10 grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 place-items-center"
                            >
                                {podiumRanks.map((rankIndex) => {
                                    const winner = topWinners[rankIndex];
                                    if (!winner) return null;

                                    const actualRank = rankIndex + 1;
                                    const isCenter = actualRank === 1;
                                    const config = podiumConfig[actualRank] || podiumConfig[2];
                                    const formattedScore = formatTime
                                        ? formatTime(winner.data?.data?.total_seconds)
                                        : "--";
                                    const badge = getRankBadge
                                        ? getRankBadge(winner.data?.data?.total_seconds || 0)
                                        : null;

                                    return (
                                        <div
                                            key={winner.user?.id || actualRank}
                                            className={`flex flex-col items-center text-center gap-4 cursor-pointer transition-transform duration-300 hover:-translate-y-2 ${isCenter ? "scale-100" : "scale-75"} sm:scale-100`}
                                            onClick={() => handleUserClick(winner)}
                                        >
                                            {/* Avatar + Icon */}
                                            <div className="relative flex flex-col items-center">

                                                {/* Icon above avatar */}
                                                <div className="absolute -top-5 sm:-top-6 z-20">
                                                    <div
                                                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${config.iconBg} backdrop-blur-sm`}
                                                    >
                                                        {getIcon(actualRank)}
                                                    </div>
                                                </div>

                                                {/* Avatar */}
                                                <div
                                                    className={`relative z-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white/5 ring-offset-4 dark:ring-offset-[#050d1b] ring-offset-[#dadee7]  ${config.avatarRing} shadow-[0_0_25px_rgba(0,0,0,0.4)]`}
                                                >
                                                    <Avatar
                                                        className="w-full h-full object-cover rounded-full"
                                                        image={winner.user?.image}
                                                        name={winner.user?.name}
                                                        lastActivity={winner.user?.last_online || null}
                                                        onlineCircleClass="hidden"
                                                    />
                                                </div>
                                            </div>

                                            {/* Podium Base */}
                                            <div
                                                className={`relative w-34 sm:w-64 ${config.height} ${config.baseGradient} ${config.glow} rounded-[26px] px-3 py-2 sm:px-6 sm:py-2 flex flex-col justify-center items-center`}>
                                                <div className="absolute inset-x-6 top-4 h-10 bg-white/10 blur-2xl sm:blur-3xl" />
                                                <div className="absolute inset-0 border border-white/5 rounded-[26px]" />

                                                {/* Rank Circle */}
                                                <div
                                                    className={`absolute -top-8 sm:-top-11 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg ${config.bg} ${config.rankCircleBg} z-20`}
                                                >
                                                    {actualRank}
                                                </div>

                                                {/* Name */}
                                                <div className="relative z-10 mb-2 sm:mb-4">
                                                    <h3 className="text-white text-sm sm:text-lg font-semibold truncate max-w-[5rem] sm:max-w-[12rem]">
                                                        {winner.user?.name || "Unknown"}
                                                    </h3>
                                                </div>

                                                {/* Score */}
                                                <div className="relative z-10">
                                                    <p
                                                        className={`text-xl sm:text-3xl font-bold text-white drop-shadow-xl${config.accent}`}
                                                    >
                                                        {formattedScore}
                                                    </p>
                                                </div>

                                                {/* Badge */}
                                                {badge && (
                                                    <div
                                                        className={`relative z-10 mt-3 sm:mt-5 w-full rounded-[20px] sm:rounded-[26px] ${config.pillBg} py-1 sm:py-2 text-white font-semibold uppercase tracking-widest text-[0.55rem] sm:text-xs`}
                                                    >
                                                        {badge}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>


                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default BoardPodium;

