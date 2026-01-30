import Rolegard from '@/components/rolegard';
import { Link } from '@inertiajs/react';

export default function StatsGrid({ statsData = [], items = [] }) {
    const data = (statsData?.length ? statsData : items) ?? [];

    if (!data.length) return null;

    return (
        <div className="bg-light py-0 sm:py-0 dark:bg-dark">
            <div className="mx-auto w-full">
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
                                    className={`relative overflow-hidden rounded-2xl bg-light p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] dark:bg-dark_gray ${stat.href ? 'cursor-pointer' : ''}`}
                                >
                                    {Icon && <Icon size={70} className="absolute right-4 bottom-0 text-alpha opacity-70 dark:text-alpha" />}
                                    <h3 className="relative z-10 mb-2 text-sm font-semibold tracking-wide text-beta uppercase dark:text-white/80">
                                        {stat.title}
                                    </h3>
                                    <p className="relative z-10 mb-1 text-3xl font-bold text-beta sm:text-4xl dark:text-white">
                                        {displayValue}
                                        {stat.suffix && <span className="ml-1 text-xl font-semibold">{stat.suffix}</span>}
                                    </p>
                                    {description && <p className="relative z-10 text-xs text-muted-foreground">{description}</p>}
                                </CardWrapper>
                            </Rolegard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
