import Banner from '@/components/banner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';
// import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import illustration from "../../../../public/assets/images/banner/Personal settings-cuate.png"

const sidebarNavItems = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6 pl-2 sm:pl-4 md:pl-6 lg:pl-8 xl:pl-12 2xl:pl-10">
            <Heading title="Settings" description="Manage your profile and account settings" />
            <Banner
            illustration={illustration}
            />

            <div className=" flex flex-col gap-8 pl-2 sm:pl-4 md:pl-6 lg:pl-8 xl:pl-12 2xl:pl-30">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex gap-5">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-fit justify-center px-12 py-5 rounded-full dark:bg-[#FAFAFA] dark:text-[#171717] hover:text-[#FAFAFA] bg-[#171717] text-[#FAFAFA] hover:bg-[#FFC801] dark:hover:bg-[#FFC801] dark:hover:text-[#FAFAFA] transition-all', {
                                    'dark:bg-[#FFC801] bg-[#FFC801] text-[#171717] dark:text-[#171717]': currentPath === (typeof item.href === 'string' ? item.href : item.href.url),
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
