import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import students from '../../../../../public/assets/images/banner/students.png';
import NotificationForm from './Partials/NotificationForm';
import NotificationHistory from './Partials/NotificationHistory';

const INITIAL_HISTORY = [
    {
        id: 1,
        title: 'New training session',
        body: 'A new Geek session starts tomorrow at 9:00 AM. Don’t forget to check in!',
        sentAt: '2026-06-20T14:30:00',
        status: 'sent',
        recipientCount: 128,
    },
    {
        id: 2,
        title: 'App maintenance',
        body: 'The mobile app will be briefly unavailable tonight from 11 PM to midnight.',
        sentAt: '2026-06-18T09:15:00',
        status: 'sent',
        recipientCount: 342,
    },
    {
        id: 3,
        title: 'Welcome back!',
        body: 'We missed you. Open the app to see what’s new this week.',
        sentAt: '2026-06-15T16:45:00',
        status: 'sent',
        recipientCount: 89,
    },
];

export default function Announcements() {
    const { auth } = usePage().props;
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSend = ({ title, body }) => {
        const newNotification = {
            id: Date.now(),
            title,
            body,
            sentAt: new Date().toISOString(),
            status: 'sent',
            recipientCount: 0,
        };

        setHistory((prev) => [newNotification, ...prev]);
        setSuccessMessage('Notification sent successfully. It has been added to the history below.');
        window.setTimeout(() => setSuccessMessage(''), 4000);
    };

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

                {successMessage && (
                    <div className="px-4 py-3 text-sm border rounded-lg border-good/30 bg-good/10 text-good dark:border-good/40 dark:bg-good/15">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <NotificationForm onSend={handleSend} />
                    </div>

                    <div className="lg:col-span-3">
                        <NotificationHistory notifications={history} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


