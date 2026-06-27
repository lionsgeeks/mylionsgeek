import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import students from '../../../../../public/assets/images/banner/students.png';
import NotificationForm from './Partials/NotificationForm';
import NotificationHistory from './Partials/NotificationHistory';

export default function Announcements({ announcements }) {
    const { auth } = usePage().props;
    console.log(announcements)
    return (
        <AppLayout>
            <div className="flex flex-col gap-8 p-6">
                <Head title="Send notification" />

                <Banner
                    illustration={students}
                    userName={auth?.user?.name ?? ''}
                    title="Push notifications"
                    description="Send push notifications to mobile app users. Title and message are delivered to their devices."
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
        </AppLayout>
    );
}


