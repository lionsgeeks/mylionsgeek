import { Avatar } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Calendar, Clock, Monitor, Users } from 'lucide-react';

function EmptyState({ message }) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}

function StatusBadge({ status }) {
    return (
        <span className="inline-flex rounded-full border border-alpha/25 bg-alpha/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-beta uppercase dark:text-light">
            {status || 'N/A'}
        </span>
    );
}

export function RecentReservationsPanel({ items = [] }) {
    if (items.length === 0) {
        return <EmptyState message="No recent reservations" />;
    }

    return (
        <ul className="space-y-3">
            {items.map((reservation) => (
                <li key={reservation.id}>
                    <Link
                        href={`/admin/reservations/${reservation.id}/details`}
                        className="group flex items-start justify-between gap-4 rounded-xl border border-alpha/12 bg-alpha/[0.03] px-5 py-5 transition-all hover:border-alpha/30 hover:bg-alpha/[0.07] dark:border-light/10 dark:bg-alpha/[0.05] dark:hover:bg-alpha/[0.08]"
                    >
                        <div className="min-w-0 flex-1 space-y-2">
                            <p className="truncate text-base font-semibold text-beta dark:text-light">{reservation.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {reservation.user_name} · {reservation.studio_name}
                            </p>
                            <p className="text-xs text-beta/55 dark:text-light/55">
                                {reservation.date} · {reservation.time}
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2.5 pt-0.5">
                            <StatusBadge status={reservation.type} />
                            <span className="text-[11px] text-muted-foreground">{reservation.created_at}</span>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export function PendingAppointmentsPanel({ items = [] }) {
    if (items.length === 0) {
        return <EmptyState message="No pending appointments" />;
    }

    return (
        <ul className="space-y-3">
            {items.map((appointment) => (
                <li
                    key={appointment.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-alpha/12 bg-alpha/[0.03] px-5 py-4 dark:border-light/10 dark:bg-alpha/[0.05]"
                >
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate font-semibold text-beta dark:text-light">{appointment.title}</p>
                        <p className="text-sm text-muted-foreground">{appointment.user_name}</p>
                        <p className="text-xs text-beta/55 dark:text-light/55">
                            {appointment.date} · {appointment.time}
                        </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{appointment.created_at}</span>
                </li>
            ))}
        </ul>
    );
}

export function RecentUsersPanel({ items = [] }) {
    if (items.length === 0) {
        return <EmptyState message="No recent members" />;
    }

    return (
        <ul className="space-y-3">
            {items.map((user) => (
                <li key={user.id}>
                    <Link
                        href={`/admin/users/${user.id}`}
                        className="flex items-center gap-4 rounded-xl border border-alpha/12 bg-alpha/[0.03] px-5 py-4 transition-all hover:border-alpha/30 hover:bg-alpha/[0.07] dark:border-light/10 dark:bg-alpha/[0.05]"
                    >
                        <Avatar
                            className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-alpha/20"
                            image={user.image}
                            name={user.name}
                            onlineCircleClass="hidden"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-beta dark:text-light">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{user.created_at}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function PulseRow({ label, value, total, href }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    const content = (
        <div className="rounded-xl border border-alpha/12 bg-alpha/[0.03] px-4 py-4 dark:border-light/10 dark:bg-alpha/[0.05]">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-beta dark:text-light">{label}</span>
                <span className="text-sm font-bold text-alpha">
                    {value}
                    {total ? <span className="font-normal text-muted-foreground"> / {total}</span> : null}
                </span>
            </div>
            {total > 0 && (
                <div className="h-1.5 overflow-hidden rounded-full bg-beta/10 dark:bg-light/10">
                    <div className="h-full rounded-full bg-alpha transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block transition-opacity hover:opacity-90">
                {content}
            </Link>
        );
    }

    return content;
}

export function WorkspacePulsePanel({ computerStats = {}, equipmentStats = {}, projectStats = {}, pendingAppointments = 0 }) {
    const rows = [
        {
            label: 'Computers operational',
            value: computerStats.working || 0,
            total: computerStats.total || 0,
            href: '/admin/computers',
            excludeRoles: ['studio_responsable'],
        },
        {
            label: 'Equipment operational',
            value: equipmentStats.working || 0,
            total: equipmentStats.total || 0,
            href: '/admin/equipements',
            excludeRoles: ['coach'],
        },
        {
            label: 'Active projects',
            value: projectStats.active || 0,
            total: projectStats.total || 0,
            href: '/admin/projects',
            excludeRoles: ['studio_responsable'],
        },
    ];

    return (
        <div className="space-y-4">
            {pendingAppointments > 0 && (
                <Link
                    href="/admin/appointments"
                    className="flex items-center gap-3 rounded-xl border border-alpha/25 bg-alpha/10 px-4 py-4 transition-colors hover:bg-alpha/15"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-alpha/20">
                        <AlertCircle className="h-5 w-5 text-alpha" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-beta dark:text-light">{pendingAppointments} pending appointments</p>
                        <p className="text-xs text-muted-foreground">Review and approve waiting requests</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-alpha" />
                </Link>
            )}

            <div className="space-y-3">
                {rows.map((row) => (
                    <PulseRow key={row.label} label={row.label} value={row.value} total={row.total} href={row.href} />
                ))}
            </div>
        </div>
    );
}

export const activityPanelMeta = {
    reservations: { title: 'Recent Reservations', icon: Calendar, href: '/admin/reservations' },
    appointments: { title: 'Pending Appointments', icon: Clock, href: '/admin/appointments' },
    users: { title: 'New Members', icon: Users, href: '/admin/users' },
    pulse: { title: 'Workspace Pulse', icon: Monitor, href: '/admin/analytics/global', hrefLabel: 'Full analytics' },
};
