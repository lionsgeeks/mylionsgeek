import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Building2, Timer, CalendarDays, Monitor, Wrench, GraduationCap, ClipboardList, Settings, AwardIcon, FolderOpen, Gamepad2, User } from 'lucide-react';
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
        icon: Users
    },

    {
        id: 'projects',
        title: 'Projects',
        href: '/admin/projects',
        icon: FolderOpen
    },

    {
        id: 'leaderboard',
        title: 'LeaderBoard',
        href: '/students/leaderboard',
        icon: AwardIcon
    },

    {
        id: 'spaces',
        title: 'Spaces ',
        href: '/admin/places',
        icon: Building2,

    },
    { id: 'reservations', title: 'Reservations', href: '/admin/reservations', icon: Timer },

    { id: 'computers', title: 'Computers', href: '/admin/computers', icon: Monitor },
    { id: 'equipment', title: 'Equipment', href: '/admin/equipements', icon: Wrench },
    { id: 'training', title: 'Training', href: '/training', icon: GraduationCap },
    // { title: 'Games', href: '/games', icon: Gamepad2 },
    { id: 'settings', title: 'Settings', href: '/settings', icon: Settings },
];

// Footer links removed per request

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRoles = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role].filter(Boolean);
    const isStudioResponsable = userRoles.includes('studio_responsable');
    const studioResponsableAllowed = new Set(['dashboard', 'feed', 'spaces', 'reservations', 'equipment', 'settings']);
    const navItems = isStudioResponsable
        ? mainNavItems.filter((item) => studioResponsableAllowed.has(item.id))
        : mainNavItems;

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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavUser /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
