import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import profile from '@/routes/profile';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SearchDialog from '@/components/search-dialog';
import ChatIcon from '@/components/chat/ChatIcon';
import NotificationIcon from '@/components/NotificationIcon';

import { NavUser } from '@/components/nav-user';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <header className="flex py-8 dark:bg-dark bg-light h-16 shrink-0 items-center justifwy-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
            </div>
            <div className="flex w-full items-center lg:justify-between justify-end pl-4">
                <div className="lg:flex flex-col leading-tight hidden">
                    <span className="text-xl font-semibold tracking-tight text-foreground">{hours}</span>
                    <span className="text-sm text-muted-foreground">{dateStr}</span>
                </div>
                <SearchDialog className="hidden sm:flex" />
                <div className="flex items-center gap-4 ">

                    <ChatIcon />
                    <NotificationIcon />
                    <Link href="/feed" prefetch className="flex items-center">
                        <Button variant="ghost" size="icon" className="flex h-9 w-9 items-center justify-center rounded-md" aria-label="Home">
                            <Home className="h-5 w-5 flex-shrink-0" />
                        </Button>
                    </Link>
                    <NavUser />
                    <div className="">
                        {/* component change mode */}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
