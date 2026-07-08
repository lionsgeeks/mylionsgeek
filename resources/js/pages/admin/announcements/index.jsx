import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import students from '../../../../../public/assets/images/banner/students.png';
import NotificationForm from './partials/NotificationForm';
import NotificationHistory from './partials/NotificationHistory';

export default function Announcements({ announcements }) {
    const { auth, flash } = usePage().props;

    return (
        <div className="flex flex-col gap-8 p-6">
            <Head title="App Notification" />

            {flash?.success && (
                <div className="rounded-lg border border-good/30 bg-good/10 px-4 py-3 text-sm text-good">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                    {flash.error}
                </div>
            )}

            <Banner
                illustration={students}
                userName={auth?.user?.name ?? ''}
                title="App Notification"
                description="Publish for web and mobile. Web users see it in the notification bell; mobile users with the app get a push notification."
            />

            <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <NotificationForm />
                </div>

                <div className="lg:col-span-3">
                    <NotificationHistory announcements={announcements} />
                </div>
            </div>
        </div>
    );
}

Announcements.layout = (page) => <AppLayout>{page}</AppLayout>;
