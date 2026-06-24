import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import illustration from '../../../public/assets/images/banner/men.png';
import pattern from '../../../public/assets/images/banner/pattern.png';
import MainDashboard from './admin/dashboard/index';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard({
    stats,
    computerStats,
    equipmentStats,
    projectStats,
    recentReservations,
    pendingAppointments,
    recentUsers,
    todayReservations,
    weekReservations,
    monthReservations,
    reservationTrend,
    taskCompletionTrend,
    isProjectOwner,
    projectOwnerActivity,
}) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-full flex-1 bg-light dark:bg-dark">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
                    <Banner
                        illustration={illustration}
                        pattern={pattern}
                        description="Easily book, manage and track studio gear and equipment Streamline your studio workflow"
                        title="Welcome to the Dashboard"
                        userName={auth.user.name}
                        greeting="Hi"
                    />

                    <MainDashboard
                        stats={stats}
                        computerStats={computerStats}
                        equipmentStats={equipmentStats}
                        projectStats={projectStats}
                        recentReservations={recentReservations}
                        pendingAppointments={pendingAppointments}
                        recentUsers={recentUsers}
                        todayReservations={todayReservations}
                        weekReservations={weekReservations}
                        monthReservations={monthReservations}
                        reservationTrend={reservationTrend}
                        taskCompletionTrend={taskCompletionTrend}
                        isProjectOwner={isProjectOwner}
                        projectOwnerActivity={projectOwnerActivity}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
