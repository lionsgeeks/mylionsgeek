import { Link } from '@inertiajs/react';
import { CheckCircle2, CircleDot, FolderKanban, PlusCircle } from 'lucide-react';

const MAX_ITEMS = 5;

const activityMeta = {
    created: {
        label: 'Task created',
        icon: PlusCircle,
    },
    completed: {
        label: 'Task completed',
        icon: CheckCircle2,
    },
    in_progress: {
        label: 'Task in progress',
        icon: CircleDot,
    },
    review: {
        label: 'Task in review',
        icon: FolderKanban,
    },
};

function EmptyState() {
    return <p className="py-8 text-center text-sm text-muted-foreground">No recent project activity on your owned projects.</p>;
}

export default function ProjectOwnerActivityPanel({ items = [] }) {
    const visibleItems = items.slice(0, MAX_ITEMS);

    if (visibleItems.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="custom-scrollbar max-h-[360px] overflow-y-auto pr-1">
            <ul className="space-y-2.5">
                {visibleItems.map((item) => {
                    const meta = activityMeta[item.type] ?? activityMeta.created;
                    const Icon = meta.icon;

                    return (
                        <li key={item.id}>
                            <Link
                                href={item.href}
                                className="group flex items-start gap-3 rounded-xl border border-alpha/12 bg-alpha/[0.03] px-4 py-3 transition-all hover:border-alpha/30 hover:bg-alpha/[0.07] dark:border-light/10 dark:bg-alpha/[0.05]"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alpha/12 ring-1 ring-alpha/20">
                                    <Icon className="h-3.5 w-3.5 text-alpha" />
                                </div>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-semibold tracking-wide text-alpha uppercase">{meta.label}</span>
                                        <span className="text-[10px] text-muted-foreground">{item.time_ago}</span>
                                    </div>
                                    <p className="truncate text-sm font-semibold text-beta group-hover:text-alpha dark:text-light">{item.task_title}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {item.project_name} · {item.actor_name}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
