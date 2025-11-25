import { usePage } from "@inertiajs/react";
import AppHeaderLayout from "@/layouts/app/app-header-layout";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";
import ShowSkippableModal from "@/components/ShowSkippableModal";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { auth } = usePage<{ auth: { user: { role: string[] | string } } }>().props;

    // Always treat roles as an array
    const userRoles: string[] = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role];

    // If the user has 'admin' or 'studio_responsable', show sidebar (even if they are also 'coach')
    const isAdmin = userRoles.includes('admin') || userRoles.includes('moderateur') || userRoles.includes('studio_responsable')|| userRoles.includes('coach');

    // Show header only for students/coworkers without admin
    const isStudentOrCoworker = !isAdmin && userRoles.some(role => ["student", "coworker"].includes(role));

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isStudentRoute =
        currentPath.startsWith('/feed') ||
        currentPath.startsWith('/student') ||
        currentPath.startsWith('/students');

    const Layout = isStudentOrCoworker || isStudentRoute ? AppHeaderLayout : isAdmin ? AppSidebarLayout : AppHeaderLayout;


    return (
        <Layout breadcrumbs={breadcrumbs} {...props}>
            <div className={`bg-light dark:bg-dark ${userRoles.includes('student') && 'pt-20'}  shadow-lg w-[96%] my-6 mx-auto h-full rounded-lg`}>
                <ShowSkippableModal />
                {children}
            </div>
        </Layout>
    );
}
