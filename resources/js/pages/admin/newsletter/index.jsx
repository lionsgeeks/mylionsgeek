import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import students from '../../../../../public/assets/images/banner/students.png';
import NewsletterForm from './partials/NewsletterForm';
import NewsletterHistory from './partials/NewsletterHistory';

export default function Newsletter({
    users = [],
    trainings = [],
    roles = [],
    history = [],
    canSelectRoles = true,
    isCoachScoped = false,
}) {
    const { auth } = usePage().props;

    return (
        <div className="flex flex-col gap-8 p-6">
            <Head title="Newsletter" />

            <Banner
                illustration={students}
                userName={auth?.user?.name ?? ''}
                title="Newsletter"
                description={
                    isCoachScoped
                        ? 'Send multilingual emails to students in the trainings assigned to you.'
                        : 'Compose rich multilingual emails and send them to members by training, role, or individual selection.'
                }
            />

            <NewsletterForm
                users={users}
                trainings={trainings}
                roles={roles}
                canSelectRoles={canSelectRoles}
            />

            <NewsletterHistory history={history} />
        </div>
    );
}

Newsletter.layout = (page) => <AppLayout>{page}</AppLayout>;
