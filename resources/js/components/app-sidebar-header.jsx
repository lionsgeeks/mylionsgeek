import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import profile from '@/routes/profile';
import { Link, usePage } from '@inertiajs/react';
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
        <header className="flex dark:bg-dark bg-light h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
            </div>
            <div className="flex w-full items-center justify-between pl-4">
                <div className="flex flex-col leading-tight">
                    <span className="text-xl font-semibold tracking-tight text-foreground">{hours}</span>
                    <span className="text-sm text-muted-foreground">{dateStr}</span>
                </div>
                <Link href={profile.edit()} prefetch className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="font-semibold leading-tight text-foreground">{auth.user.name}</div>
                        <div className="text-sm text-muted-foreground">{auth.user?.access?.role ?? 'member'}</div>
                    </div>
                    <Avatar className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback>{auth.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
        </header>
    );
}
