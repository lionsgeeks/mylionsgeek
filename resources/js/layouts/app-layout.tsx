import ShowSkippableModal from '@/components/ShowSkippableModal';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { auth } = usePage<{ auth: { user: { role: string[] | string } } }>().props;

    // Always treat roles as an array
    const userRoles: string[] = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role];

    // If the user has 'admin', show sidebar (even if they are also 'coach')
    const isAdmin = userRoles.includes('admin');

    // Show header only for students/coworkers without admin
    const isStudentOrCoworker = !isAdmin && userRoles.some((role) => ['student', 'coworker'].includes(role));

    const Layout = isAdmin ? AppSidebarLayout : isStudentOrCoworker ? AppHeaderLayout : AppHeaderLayout;

    return (
        <Layout breadcrumbs={breadcrumbs} {...props}>
            <div className="mx-auto my-6 h-full w-[96%] rounded-lg bg-light shadow-lg dark:bg-dark">
                <ShowSkippableModal />
                {children}
            </div>
        </Layout>
    );
}
