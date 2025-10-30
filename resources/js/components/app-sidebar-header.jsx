import { NavUser } from '@/components/nav-user';
import SearchDialog from '@/components/search-dialog';
import ThemeToggle from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { auth } = usePage().props;
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hours = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <header className="justifwy-between flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-light px-6 py-8 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-dark">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
            </div>
            <div className="flex w-full items-center justify-end pl-4 lg:justify-between">
                <div className="hidden flex-col leading-tight lg:flex">
                    <span className="text-xl font-semibold tracking-tight text-foreground">{hours}</span>
                    <span className="text-sm text-muted-foreground">{dateStr}</span>
                </div>
                <div className="flex items-center gap-4">
                    <SearchDialog className="hidden sm:flex" />
                    <div className="pb-2">
                        <ThemeToggle />
                    </div>
                    <NavUser />
                </div>
            </div>
        </header>
    );
}
