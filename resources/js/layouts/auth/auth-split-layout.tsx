import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const {  quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 dark:hidden" style={{ background: 'var(--color-alpha)' }} />
                <div className="absolute inset-0 hidden dark:block bg-black" />
                <div className="absolute inset-0 hidden dark:block" aria-hidden>
                    <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-[var(--color-alpha)]/20 blur-3xl" />
                    <div className="pointer-events-none absolute -left-10 top-32 size-[420px] rounded-full bg-[var(--color-alpha)]/25 blur-3xl" />
                </div>
                <Link href={home()} className="relative z-20 flex items-center text-lg font-medium">
                    <img src="/assets/images/logolionsgeek.png" alt="LionsGeek" className="mr-2 h-8 w-8" />
                    LionsGeek
                </Link>
                <div className="relative z-20 my-auto flex w-full items-center justify-center">
                    <div
                        aria-label="LionsGeek graphic"
                        className="h-[240px] w-[240px] max-w-[50%] bg-black drop-shadow-xl dark:bg-white"
                        style={{ WebkitMaskImage: 'url(/assets/images/lionsgeek_logo_2.png)', maskImage: 'url(/assets/images/lionsgeek_logo_2.png)', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskPosition: 'center', maskPosition: 'center' }}
                    />
                </div>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg text-black dark:text-white">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-black/80 dark:text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8 bg-white dark:bg-transparent lg:border-l lg:border-neutral-200 dark:lg:border-transparent">
                <div className="mx-auto w-full max-w-[420px] rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-transparent dark:bg-transparent dark:p-0 dark:shadow-none">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6">
                    <Link href={home()} className="relative z-20 flex items-center justify-center lg:hidden">
                        <img src="/assets/images/logolionsgeek.png" alt="LionsGeek" className="h-10 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
