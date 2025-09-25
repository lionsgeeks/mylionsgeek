import { usePage } from "@inertiajs/react";
import AppHeaderLayout from "@/layouts/app/app-header-layout";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;

    const isStudentOrCoworker = ["student", "coworker"].includes(auth?.user?.role);

    const Layout = isStudentOrCoworker ? AppHeaderLayout : AppSidebarLayout;

    return (
        <Layout breadcrumbs={breadcrumbs} {...props}>
            <div className="bg-light dark:bg-dark shadow-lg w-[96%] my-6 mx-auto h-full rounded-lg">
                {children}
            </div>
        </Layout>
    );
}
