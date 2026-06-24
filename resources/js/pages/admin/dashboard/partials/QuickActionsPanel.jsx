import Rolegard from '@/components/rolegard';
import { Link } from '@inertiajs/react';
import {
    AwardIcon,
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    FolderOpen,
    GraduationCap,
    Monitor,
    Timer,
    UserPlus,
    Users,
    Wrench,
} from 'lucide-react';

const quickActions = [
    { title: 'Members', href: '/admin/users', icon: Users, excludeRoles: ['studio_responsable'] },
    { title: 'Projects', href: '/admin/projects', icon: FolderOpen, excludeRoles: ['studio_responsable'] },
    { title: 'Reservations', href: '/admin/reservations', icon: Timer, excludeRoles: ['coach'] },
    { title: 'Appointments', href: '/admin/appointments', icon: Calendar, excludeRoles: [] },
    { title: 'Spaces', href: '/admin/places', icon: Building2, excludeRoles: ['coach'] },
    { title: 'Computers', href: '/admin/computers', icon: Monitor, excludeRoles: ['studio_responsable'] },
    { title: 'Equipment', href: '/admin/equipements', icon: Wrench, excludeRoles: ['coach'] },
    { title: 'Training', href: '/admin/training', icon: GraduationCap, excludeRoles: ['studio_responsable'] },
    { title: 'Leaderboard', href: '/students/leaderboard', icon: AwardIcon, authorizedRoles: ['admin', 'super_admin', 'moderateur', 'coach'] },
    { title: 'Jobs', href: '/admin/jobs', icon: Briefcase, authorizedRoles: ['admin', 'moderateur', 'super_admin'] },
    { title: 'Organisations', href: '/admin/organisations', icon: UserPlus, authorizedRoles: ['admin', 'moderateur', 'super_admin'] },
    { title: 'Analytics', href: '/admin/analytics/global', icon: BarChart3, authorizedRoles: ['admin', 'super_admin', 'moderateur'] },
];

export default function QuickActionsPanel() {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {quickActions.map((action) => {
                const Icon = action.icon;
                const content = (
                    <Link
                        href={action.href}
                        className="group flex flex-col items-center justify-center rounded-lg border border-alpha/20 bg-light/50 px-3 py-4 transition-all duration-200 hover:border-alpha/50 hover:bg-alpha/10 hover:shadow-md dark:border-light/10 dark:bg-dark/40 dark:hover:border-alpha/40 dark:hover:bg-alpha/10"
                    >
                        <Icon className="mb-2 h-5 w-5 text-beta transition-transform group-hover:scale-110 dark:text-alpha" />
                        <span className="text-center text-xs font-semibold text-beta dark:text-light">{action.title}</span>
                    </Link>
                );

                if (action.authorizedRoles?.length) {
                    return (
                        <Rolegard key={action.href} authorized={action.authorizedRoles}>
                            {content}
                        </Rolegard>
                    );
                }

                return (
                    <Rolegard key={action.href} except={action.excludeRoles || []}>
                        {content}
                    </Rolegard>
                );
            })}
        </div>
    );
}
