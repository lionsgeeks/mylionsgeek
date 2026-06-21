import Rolegard from '@/components/rolegard';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardStatCards({ statsData = [] }) {
    if (!statsData.length) return null;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;
                const displayValue = stat.value ?? 0;
                const description = stat.description ?? stat.subtitle;
                const CardWrapper = stat.href ? Link : 'div';
                const cardProps = stat.href ? { href: stat.href } : {};
                const excludeRoles = stat.excludeRoles || [];

                return (
                    <Rolegard key={stat.id || `${stat.title}-${index}`} except={excludeRoles}>
                        <CardWrapper
                            {...cardProps}
                            className={`group relative overflow-hidden rounded-2xl border border-alpha/15 bg-white p-5 transition-all duration-300 dark:border-light/10 dark:bg-dark_gray ${
                                stat.href
                                    ? 'cursor-pointer hover:-translate-y-0.5 hover:border-alpha/35 hover:shadow-[0_12px_40px_rgba(255,200,1,0.14)]'
                                    : ''
                            }`}
                        >
                            <div className="absolute inset-x-0 top-0 h-[3px] bg-alpha/80" />

                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alpha/12 ring-1 ring-alpha/20">
                                    {Icon && <Icon className="h-5 w-5 text-alpha" strokeWidth={2.2} />}
                                </div>
                                {stat.href && (
                                    <ArrowUpRight className="h-4 w-4 text-beta/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-alpha dark:text-light/30" />
                                )}
                            </div>

                            <p className="mt-5 text-3xl font-bold tracking-tight text-beta dark:text-light">{displayValue}</p>
                            <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-beta/55 uppercase dark:text-light/55">
                                {stat.title}
                            </p>
                            {description && (
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
                            )}
                        </CardWrapper>
                    </Rolegard>
                );
            })}
        </div>
    );
}
