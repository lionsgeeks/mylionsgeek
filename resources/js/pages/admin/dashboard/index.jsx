import Rolegard from '@/components/rolegard';
import {
    activityPanelMeta,
    PendingAppointmentsPanel,
    RecentReservationsPanel,
    RecentUsersPanel,
    WorkspacePulsePanel,
} from './partials/ActivityPanels';
import { ReservationTrendChart, TaskCompletionLineChart } from './partials/DashboardCharts';
import DashboardStatCards from './partials/DashboardStatCards';
import ProjectOwnerActivityPanel from './partials/ProjectOwnerActivityPanel';
import QuickActionsPanel from './partials/QuickActionsPanel';
import SectionCard from './partials/SectionCard';
import { BellRing, Calendar, LayoutDashboard, Monitor, TrendingUp, Users, Wrench, Zap } from 'lucide-react';

const MainDashboard = ({
    stats = {},
    computerStats = {},
    equipmentStats = {},
    projectStats = {},
    recentReservations = [],
    pendingAppointments = [],
    recentUsers = [],
    todayReservations = 0,
    weekReservations = 0,
    monthReservations = 0,
    reservationTrend = [],
    taskCompletionTrend = [],
    isProjectOwner = false,
    projectOwnerActivity = [],
}) => {
    const overviewStats = [
        {
            title: 'Total Users',
            value: stats.users || 0,
            icon: Users,
            description: 'Registered members',
            href: '/admin/users',
            excludeRoles: ['studio_responsable'],
        },
        {
            title: 'Reservations',
            value: stats.reservations || 0,
            icon: Calendar,
            description: `${todayReservations} today`,
            href: '/admin/reservations',
            excludeRoles: ['coach'],
        },
        {
            title: 'Computers',
            value: stats.computers || 0,
            icon: Monitor,
            description: `${computerStats.working || 0} working`,
            href: '/admin/computers',
            excludeRoles: ['studio_responsable'],
        },
        {
            title: 'Equipment',
            value: stats.equipment || 0,
            icon: Wrench,
            description: `${equipmentStats.working || 0} working`,
            href: '/admin/equipements',
            excludeRoles: ['coach'],
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <div className="mb-1 flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-alpha" />
                    <span className="text-xs font-semibold tracking-widest text-alpha uppercase">Admin workspace</span>
                </div>
                <h2 className="text-2xl font-bold text-beta dark:text-light">360° Overview</h2>
                <p className="mt-1 max-w-2xl text-sm text-beta/70 dark:text-light/70">
                    Monitor members, spaces, equipment, projects, and reservations from a single command center.
                </p>
            </div>

            <DashboardStatCards statsData={overviewStats} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Rolegard except={['coach']}>
                    <SectionCard title="Reservation activity" icon={TrendingUp} href="/admin/reservations" className="xl:col-span-2">
                        <ReservationTrendChart
                            reservationTrend={reservationTrend}
                            todayReservations={todayReservations}
                            weekReservations={weekReservations}
                            monthReservations={monthReservations}
                        />
                    </SectionCard>
                </Rolegard>

                <SectionCard title="Quick actions" icon={Zap}>
                    <QuickActionsPanel />
                </SectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Rolegard except={['studio_responsable']}>
                    <SectionCard
                        title="Task completions"
                        icon={TrendingUp}
                        href="/admin/projects"
                        className={!isProjectOwner ? 'lg:col-span-2' : ''}
                    >
                        <p className="mb-4 text-sm text-beta/65 dark:text-light/65">Tasks marked done across all projects — last 7 days</p>
                        <TaskCompletionLineChart taskCompletionTrend={taskCompletionTrend} />
                    </SectionCard>
                </Rolegard>

                {isProjectOwner && (
                    <SectionCard title="Your project updates" icon={BellRing} href="/admin/projects" hrefLabel="Manage projects">
                        <ProjectOwnerActivityPanel items={projectOwnerActivity} />
                    </SectionCard>
                )}
            </div>

            <SectionCard
                title={activityPanelMeta.pulse.title}
                icon={activityPanelMeta.pulse.icon}
                href={activityPanelMeta.pulse.href}
                hrefLabel={activityPanelMeta.pulse.hrefLabel}
            >
                <WorkspacePulsePanel
                    computerStats={computerStats}
                    equipmentStats={equipmentStats}
                    projectStats={projectStats}
                    pendingAppointments={stats.appointments || 0}
                />
            </SectionCard>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Rolegard except={['coach']}>
                    <SectionCard
                        title={activityPanelMeta.reservations.title}
                        icon={activityPanelMeta.reservations.icon}
                        href={activityPanelMeta.reservations.href}
                        contentClassName="py-1"
                    >
                        <RecentReservationsPanel items={recentReservations} />
                    </SectionCard>
                </Rolegard>

                <SectionCard
                    title={activityPanelMeta.appointments.title}
                    icon={activityPanelMeta.appointments.icon}
                    href={activityPanelMeta.appointments.href}
                >
                    <PendingAppointmentsPanel items={pendingAppointments} />
                </SectionCard>
            </div>

            <Rolegard except={['studio_responsable']}>
                <SectionCard title={activityPanelMeta.users.title} icon={activityPanelMeta.users.icon} href={activityPanelMeta.users.href}>
                    <RecentUsersPanel items={recentUsers} />
                </SectionCard>
            </Rolegard>
        </div>
    );
};

export default MainDashboard;
