import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import students from '../../../../../public/assets/images/banner/students.png';
import NewsletterForm from './partials/NewsletterForm';

export default function Newsletter({ users = [], trainings = [], roles = [] }) {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col gap-8 p-6">
            <Head title="Newsletter" />

            <Banner
                illustration={students}
                userName={auth?.user?.name ?? ''}
                title="Newsletter"
                description="Send multilingual newsletter emails to members by training, role, or individual selection."
            />

            <div className="mx-auto w-full max-w-5xl">
                <NewsletterForm users={users} trainings={trainings} roles={roles} />
            </div>
        </div>
    );
}

Newsletter.layout = (page) => <AppLayout>{page}</AppLayout>;
