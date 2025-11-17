import React from "react";

export default function StatsGrid({ statsData }) {
    return (
        <div className="bg-light dark:bg-dark py-0 sm:py-0">
            <div className="w-full mx-auto">
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${statsData?.length > 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}  gap-4`}>
                    {statsData.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="relative rounded-2xl p-6 overflow-hidden bg-light dark:bg-dark_gray shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow duration-300"
                            >
                                {/* Background Icon */}
                                <Icon
                                    size={70}
                                    className="absolute text-alpha dark:text-alpha right-4 bottom-0 opacity-70"
                                />

                                {/* Title */}
                                <h3 className="text-sm font-semibold text-beta dark:text-white/80 uppercase tracking-wide mb-2 relative z-10">
                                    {stat.title}
                                </h3>

                                {/* Value */}
                                <p className="text-3xl sm:text-4xl font-bold text-beta dark:text-white mb-1 relative z-10">
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}