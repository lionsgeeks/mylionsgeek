import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function SectionCard({ title, icon: Icon, href, hrefLabel = 'View all', children, className = '', contentClassName = '' }) {
    return (
        <div
            className={`rounded-2xl border border-alpha/15 bg-white p-5 shadow shadow-alpha/10 dark:border-light/10 dark:bg-dark_gray sm:p-6 ${className}`}
        >
            <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-beta dark:text-light">
                    {Icon && <Icon className="h-5 w-5 text-alpha" />}
                    {title}
                </h3>
                {href && (
                    <Link
                        href={href}
                        className="flex shrink-0 items-center gap-1 text-sm font-medium text-beta/70 transition-colors hover:text-alpha dark:text-light/70 dark:hover:text-alpha"
                    >
                        {hrefLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                )}
            </div>
            <div className={contentClassName}>{children}</div>
        </div>
    );
}
