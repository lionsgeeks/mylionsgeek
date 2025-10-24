import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Building2, Timer, CalendarDays, Monitor, Wrench, GraduationCap, ClipboardList, Settings, AwardIcon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: "/admin/dashboard",
        icon: LayoutGrid,
    },

    {
        title: 'Members',
        href: '/admin/users',
        icon: Users
    },
    ,

    {
        title: 'LeaderBoard',
        href: '/students/leaderboard',
        icon: AwardIcon
    },

    {
        title: 'Spaces ',
        href: '/admin/places',
        icon: Building2,

    },
    { title: 'Reservations', href: '/admin/reservations', icon: Timer },
    
    { title: 'Computers', href: '/admin/computers', icon: Monitor },
    { title: 'Equipment', href: '/admin/equipements', icon: Wrench },
    { title: 'Training', href: '/training', icon: GraduationCap },
    { title: 'Settings', href: '/settings', icon: Settings },
];

// Footer links removed per request

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={"/admin/dashboard"} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavUser /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
