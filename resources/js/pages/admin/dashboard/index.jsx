import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Users,
    Calendar,
    Monitor,
    Wrench,
    FolderOpen,
    GraduationCap,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Building2,
    Timer,
    Camera
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Rolegard from '@/components/rolegard';
import { Avatar } from '@/components/ui/avatar';

const MainDashboard = ({
    stats = {},
    computerStats = {},
    equipmentStats = {},
    projectStats = {},
    recentReservations = [],
    recentProjects = [],
    todayReservations = 0,
    weekReservations = 0,
    monthReservations = 0,
}) => {
    const allOverviewStats = [
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
        {
            title: 'Projects',
            value: stats.projects || 0,
            icon: FolderOpen,
            description: `${projectStats.active || 0} active`,
            href: '/admin/projects',
            excludeRoles: ['studio_responsable'],
        },
        {
            title: 'Trainings',
            value: stats.trainings || 0,
            icon: GraduationCap,
            description: 'Active programs',
            href: '/admin/training',
            excludeRoles: ['studio_responsable'],
        },
        {
            title: 'Appointments',
            value: stats.appointments || 0,
            icon: Clock,
            description: 'Pending approval',
            href: '/admin/appointments',
            excludeRoles: [],
        },
        {
            title: 'Cowork Spaces',
            value: stats.cowork_reservations_today || 0,
            icon: Building2,
            description: 'Today reservations',
            href: '/admin/places',
            excludeRoles: ['coach'],
        },
    ];

    const quickLinks = [
        { title: 'Users', href: '/admin/users', icon: Users, color: 'text-blue-600', excludeRoles: ['studio_responsable'] },
        { title: 'Reservations', href: '/admin/reservations', icon: Calendar, color: 'text-green-600', excludeRoles: ['coach'] },
        { title: 'Appointments', href: '/admin/appointments', icon: Clock, color: 'text-yellow-600', excludeRoles: [] },
        { title: 'Computers', href: '/admin/computers', icon: Monitor, color: 'text-purple-600', excludeRoles: ['studio_responsable'] },
        { title: 'Equipment', href: '/admin/equipements', icon: Camera, color: 'text-orange-600', excludeRoles: ['coach'] },
        { title: 'Projects', href: '/admin/projects', icon: FolderOpen, color: 'text-indigo-600', excludeRoles: ['studio_responsable'] },
        { title: 'Training', href: '/admin/training', icon: GraduationCap, color: 'text-pink-600', excludeRoles: ['studio_responsable'] },
        { title: 'Places', href: '/admin/places', icon: Building2, color: 'text-cyan-600', excludeRoles: ['coach'] },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Overview</h2>
                <StatCard statsData={allOverviewStats} />
            </div>

            <Rolegard except={['coach']}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card rounded-xl border border-sidebar-border/70 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Reservations
                            </h3>
                            <Link
                                href="/admin/reservations"
                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentReservations.length > 0 ? (
                                recentReservations.map((reservation) => (
                                    <Link
                                        key={reservation.id}
                                        href={`/admin/reservations/${reservation.id}/details`}
                                        className="block p-4 rounded-lg border border-sidebar-border/50 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">{reservation.title}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {reservation.user_name} • {reservation.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {reservation.date} • {reservation.time}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{reservation.created_at}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent reservations</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-sidebar-border/70 p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Timer className="h-5 w-5" />
                            Quick Links
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Rolegard key={link.href} except={link.excludeRoles || []}>
                                        <Link
                                            href={link.href}
                                            className="flex flex-col items-center justify-center p-4 rounded-lg border border-sidebar-border/50 hover:bg-muted/50 transition-colors group"
                                        >
                                            <Icon className={`h-6 w-6 mb-2 ${link.color} group-hover:scale-110 transition-transform`} />
                                            <span className="text-sm font-medium text-foreground">{link.title}</span>
                                        </Link>
                                    </Rolegard>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Rolegard>


            {/* hadi ma3ajbatniche */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Rolegard except={['studio_responsable']}>
                    <div className="bg-card rounded-xl border border-sidebar-border/70 p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Computer Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Working</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{computerStats.working || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium">Not Working</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{computerStats.not_working || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium">Damaged</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-600">{computerStats.damaged || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Assigned</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{computerStats.assigned || 0}</span>
                            </div>
                        </div>
                    </div>
                </Rolegard>

                <Rolegard except={['coach']}>
                    <div className="bg-card rounded-xl border border-sidebar-border/70 p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Equipment Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Working</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{equipmentStats.working || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium">Not Working</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{equipmentStats.not_working || 0}</span>
                            </div>
                        </div>
                    </div>
                </Rolegard>

                <Rolegard except={['studio_responsable']}>
                    <div className="bg-card rounded-xl border border-sidebar-border/70 p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            Project Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Active</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{projectStats.active || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Completed</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{projectStats.completed || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium">On Hold</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-600">{projectStats.on_hold || 0}</span>
                            </div>
                        </div>
                    </div>
                </Rolegard>
            </div> */}

            <Rolegard except={['coach']}>
                <div className="bg-card rounded-xl border border-sidebar-border/70 p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Reservation Trends
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-sidebar-border/50 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Today</p>
                            <p className="text-2xl font-bold text-foreground">{todayReservations}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-sidebar-border/50 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">This Week</p>
                            <p className="text-2xl font-bold text-foreground">{weekReservations}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-sidebar-border/50 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">This Month</p>
                            <p className="text-2xl font-bold text-foreground">{monthReservations}</p>
                        </div>
                    </div>
                </div>
            </Rolegard>
        </div>
    );
};

export default MainDashboard;
