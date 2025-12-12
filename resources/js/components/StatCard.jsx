import React from "react";
import { Link } from "@inertiajs/react";
import Rolegard from "@/components/rolegard";

export default function StatsGrid({ statsData = [], items = [] }) {
    const data = (statsData?.length ? statsData : items) ?? [];

    if (!data.length) return null;

    return (
        <div className="bg-light dark:bg-dark py-0 sm:py-0">
            <div className="w-full mx-auto">
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${data.length > 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    {data.map((stat, index) => {
                        const Icon = stat.icon;
                        const displayValue = stat.value ?? stat.number ?? stat.count ?? 0;
                        const description = stat.description ?? stat.subtitle;
                        const CardWrapper = stat.href ? Link : 'div';
                        const cardProps = stat.href ? { href: stat.href } : {};
                        const excludeRoles = stat.excludeRoles || [];

                        return (
                            <Rolegard key={stat.id || `${stat.title}-${index}`} except={excludeRoles}>
                                <CardWrapper
                                    {...cardProps}
                                    className={`relative rounded-2xl p-6 overflow-hidden bg-light dark:bg-dark_gray shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow duration-300 ${stat.href ? 'cursor-pointer' : ''}`}
                            >
                                {Icon && (
                                    <Icon
                                        size={70}
                                        className="absolute text-alpha dark:text-alpha right-4 bottom-0 opacity-70"
                                    />
                                )}
                                <h3 className="text-sm font-semibold text-beta dark:text-white/80 uppercase tracking-wide mb-2 relative z-10">
                                    {stat.title}
                                </h3>
                                <p className="text-3xl sm:text-4xl font-bold text-beta dark:text-white mb-1 relative z-10">
                                    {displayValue}
                                    {stat.suffix && <span className="text-xl font-semibold ml-1">{stat.suffix}</span>}
                                </p>
                                {description && (
                                    <p className="text-xs text-muted-foreground relative z-10">
                                        {description}
                                    </p>
                                )}
                                </CardWrapper>
                            </Rolegard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
