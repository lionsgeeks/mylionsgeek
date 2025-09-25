import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Building2, Timer, CalendarDays, Monitor, Wrench, GraduationCap, ClipboardList, Settings } from 'lucide-react';
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

    {
        title: 'Places',
        href: '/places',
        icon: Building2,
        chevron: true,
        children: [
            { title: 'Studios', href: '/places/studios', icon: Building2 },
            { title: 'Meeting room', href: '/places/meeting-room', icon: Building2 },
            { title: 'Co-work', href: '/places/co-work', icon: Building2 },
        ],
    },
    { title: 'Reservations', href: '/reservations', icon: Timer },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
        chevron: true,
        children: [
            { title: 'Studio', href: '/calendar/studio', icon: CalendarDays },
            { title: 'Meeting Room', href: '/calendar/meeting-room', icon: CalendarDays },
            { title: 'Co-work', href: '/calendar/co-work', icon: CalendarDays },
            { title: 'Exterior', href: '/calendar/exterior', icon: CalendarDays },
        ],
    },
    { title: 'Computers', href: '/admin/computers', icon: Monitor },
    { title: 'Equipment', href: '/equipment', icon: Wrench },
    { title: 'Training', href: '/training', icon: GraduationCap },
    { title: 'Attendance', href: '/attendance', icon: ClipboardList },
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
