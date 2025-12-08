import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Building2, Timer, CalendarDays, Monitor, Wrench, GraduationCap, ClipboardList, Settings, AwardIcon, FolderOpen, Gamepad2, User, Calendar } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        href: "/admin/dashboard",
        icon: LayoutGrid,
    },
    {
        id: 'feed',
        title: 'Feed',
        href: "/feed",
        icon: User,

    },

    {
        id: 'members',
        title: 'Members',
        href: '/admin/users',
        icon: Users,
        excludedRoles: ['studio_responsable'],
    },

    {
        id: 'projects',
        title: 'Projects',
        href: '/admin/projects',
        icon: FolderOpen,
        excludedRoles: ['studio_responsable'],
    },

    {
        id: 'leaderboard',
        title: 'LeaderBoard',
        href: '/students/leaderboard',
        icon: AwardIcon,
        excludedRoles: ['studio_responsable'],
    },

    {
        id: 'spaces',
        title: 'Spaces ',
        href: '/admin/places',
        icon: Building2,
        excludedRoles: ['coach'],

    },
    { id: 'reservations', title: 'Reservations', href: '/admin/reservations', icon: Timer, excludedRoles: ['coach'] },
    { id: 'appointments', title: 'Appointments', href: '/admin/appointments', icon: Calendar },

    { id: 'computers', title: 'Computers', href: '/admin/computers', icon: Monitor, excludedRoles: ['studio_responsable'] },
    { id: 'equipment', title: 'Equipment', href: '/admin/equipements', icon: Wrench, excludedRoles: ['coach'] },
    { id: 'training', title: 'Training', href: '/admin/training', icon: GraduationCap, excludedRoles: ['studio_responsable'] },
    // { id: 'games', title: 'Games', href: '/games', icon: Gamepad2 },
    { id: 'settings', title: 'Settings', href: '/settings', icon: Settings },
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
