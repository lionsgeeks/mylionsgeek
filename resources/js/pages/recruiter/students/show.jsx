import AppLayout from '@/layouts/app-layout';
import StudentProfile from '@/pages/students/user/partials/StudentProfile';
import { Head } from '@inertiajs/react';

export default function RecruiterStudentShow({ user, profilePostsPreview, profilePostsTotal }) {
    const title = user?.user?.name ? `${user.user.name} · Profile` : 'Student profile';

    return (
        <AppLayout>
            <Head title={title} />
            <StudentProfile user={user} profilePostsPreview={profilePostsPreview} profilePostsTotal={profilePostsTotal} nested />
        </AppLayout>
    );
}
