import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    AwardIcon,
    Briefcase,
    Building2,
    Calendar,
    ClipboardList,
    Flag,
    FolderOpen,
    GraduationCap,
    LayoutGrid,
    Megaphone,
    Monitor,
    Settings,
    Smartphone,
    Timer,
    UserPlus,
    Users,
    Wrench,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const getRecruiterHiringNavItems = () => [
    {
        id: 'recruiter_dashboard',
        title: 'Dashboard',
        href: '/recruiter/dashboard',
        icon: LayoutGrid,
        authorizedRoles: ['recruiter'],
    },
    {
        id: 'recruiter_jobs',
        title: 'Jobs',
        href: '/recruiter/jobs',
        icon: Briefcase,
        authorizedRoles: ['recruiter'],
    },
    {
        id: 'recruiter_students',
        title: 'Students',
        href: '/recruiter/students',
        icon: GraduationCap,
        authorizedRoles: ['recruiter'],
    },
    {
        id: 'recruiter_applications',
        title: 'Applications',
        href: '/recruiter/applications',
        icon: ClipboardList,
        authorizedRoles: ['recruiter'],
    },
    {
        id: 'recruiter_interviews',
        title: 'Interview calendar',
        href: '/recruiter/interviews',
        icon: Calendar,
        authorizedRoles: ['recruiter'],
    },
    {
        id: 'recruiter_settings',
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        authorizedRoles: ['recruiter'],
    },
];

const getDashboardItems = () => [
    {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        id: 'members',
        title: 'Members',
        href: '/admin/users',
        icon: Users,
        excludedRoles: ['studio_responsable'],
    },
];

const getCommunityItems = () => [

    {
        id: 'leaderboard',
        title: 'LeaderBoard',
        href: '/students/leaderboard',
        icon: AwardIcon,
        authorizedRoles: ['admin', 'coach'],
    },
    {
        id: 'training',
        title: 'Training',
        href: '/admin/training',
        icon: GraduationCap,
        authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach'],
    },
];
const getJobsItems = () => [

    {
        id: 'jobs',
        title: 'Jobs',
        href: '/admin/jobs',
        icon: Briefcase,
        authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach'],
    },
    {
        id: 'organisations',
        title: 'Organisations',
        href: '/admin/organisations',
        icon: UserPlus,
        authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach'],
    },
];

const getSpacesItems = () => [
    {
        id: 'spaces',
        title: 'Spaces',
        href: '/admin/places',
        icon: Building2,
        authorizedRoles: ['admin', 'super_admin', 'moderateur', 'studio_responsable'],
    },
    { id: 'reservations', title: 'Reservations', href: '/admin/reservations', icon: Timer, excludedRoles: ['coach'] },
    { id: 'appointments', title: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { id: 'computers', title: 'Computers', href: '/admin/computers', icon: Monitor, authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach'] },
    { id: 'equipment', title: 'Equipment', href: '/admin/equipements', icon: Wrench, excludedRoles: ['coach'] },
];

const getWorkItems = () => [
    {
        id: 'projects',
        title: 'Projects',
        href: '/admin/projects',
        icon: FolderOpen,
        excludedRoles: ['studio_responsable'],
    },
];

const getGeneralItems = () => [
    {
        id: 'post_reports',
        title: 'Post Reports',
        href: '/admin/post-reports',
        icon: Flag,
        authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach', 'studio_responsable'],
    },
    {
        id: 'announcements',
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Megaphone,
        authorizedRoles: ['admin'],
    },
    {
        id: 'appversion',
        title: 'App Version',
        href: '/admin/appversion',
        icon: Smartphone,
        authorizedRoles: ['admin', 'super_admin'],
    },
];

function RecruiterSidebarContext() {
    const { auth } = usePage().props;
    const recruiting = auth?.recruiting;

    if (!recruiting?.organization_name) {
        return null;
    }

    const isOwner = recruiting.membership_type === 'organisation_account';

    return (
        <div className="mx-2 mb-2 rounded-md border border-alpha/20 bg-alpha/5 px-3 py-2.5 group-data-[collapsible=icon]:hidden dark:border-light/10">
            <p className="truncate text-sm font-semibold text-beta dark:text-light">{recruiting.organization_name}</p>
            <p className="mt-0.5 text-xs text-beta/65 dark:text-light/65">
                {isOwner ? 'Organisation owner' : 'Team member'}
            </p>
        </div>
    );
}

// Check if user is one of the appointment persons
const isAppointmentPerson = (user) => {
    if (!user) return false;

    const personNames = ['Mahdi Bouziane', 'Hamid Boumehraz', 'Amina Khabab', 'Ayman Boujjar'];
    const emailMapping = {
        'mahdi.bouziane@lionsgeek.com': true,
        'hamid.boumehraz@lionsgeek.com': true,
        'amina.khabab@lionsgeek.com': true,
        'aymenboujjar12@gmail.com': true,
    };

    if (personNames.includes(user.name)) {
        return true;
    }

    if (user.email && emailMapping[user.email.toLowerCase()]) {
        return true;
    }

    return false;
};

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const userRoles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
    const isStaff = userRoles.some((r) => ['admin', 'moderateur', 'studio_responsable', 'coach', 'super_admin', 'pro'].includes(r));
    const isRecruiterOnlySidebar = userRoles.includes('recruiter') && !isStaff;

    const logoHref = isRecruiterOnlySidebar ? '/recruiter/dashboard' : '/admin/dashboard';

    const navGroups = useMemo(() => {
        if (isRecruiterOnlySidebar) return null;

        const spacesItems = getSpacesItems().filter((item) => {
            if (item.id === 'appointments') return isAppointmentPerson(user);
            return true;
        });

        return {
            dashboard: getDashboardItems(),
            community: getCommunityItems(),
            spaces: spacesItems,
            work: getWorkItems(),
            general: getGeneralItems(),
        };
    }, [user, isRecruiterOnlySidebar]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {isRecruiterOnlySidebar && <RecruiterSidebarContext />}
            </SidebarHeader>

            <SidebarContent>
                {isRecruiterOnlySidebar ? (
                    <NavMain label="Hiring" items={getRecruiterHiringNavItems()} />
                ) : navGroups ? (
                    <>
                        <NavMain items={navGroups.dashboard} />
                        <NavMain label="Community" items={navGroups.community} collapsible />
                        <NavMain label="Spaces & Resources" items={navGroups.spaces} collapsible />
                        <NavMain label="Work" items={navGroups.work} collapsible />
                        {auth.user.role.includes('admin') && (
                            <NavMain label="General" items={navGroups.general} collapsible />
                        )}
                    </>
                ) : null}
            </SidebarContent>

            <SidebarFooter>{/* <NavUser /> */}</SidebarFooter>
        </Sidebar>
    );
}
