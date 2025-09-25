import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, BellRing, Headphones, ClipboardCheck } from 'lucide-react';
import { login } from '@/routes';

export default function Landing() {
    const { auth } = usePage().props;

    if (auth?.user) {
        // If logged in, don't allow access to public landing; redirect via Inertia
        // Using a client-guard; server routes should also protect this.
        window.location.href = '/admin/dashboard';
        return null;
    }

    return (
        <div className="relative min-h-svh bg-background text-foreground">
            <Head title="LionsGeek" />

            {/* Dark-mode page-wide gradient overlay */}
            <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block" aria-hidden>
                <div className="absolute -left-40 -top-40 size-[560px] rounded-full bg-[var(--color-alpha)]/22 blur-3xl" />
                <div className="absolute left-1/3 top-1/4 size-[560px] rounded-full bg-[var(--color-alpha)]/16 blur-3xl" />
                <div className="absolute right-[-10%] bottom-[-10%] size-[680px] rounded-full bg-[var(--color-alpha)]/26 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(700px_340px_at_28%_22%,rgba(255,200,1,0.12),transparent_65%)]" />
            </div>

            <header className="sticky top-0 z-20 border-b border-sidebar-border/70 bg-white dark:bg-neutral-900">
                <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:max-w-7xl">
                    <div className="flex items-center gap-2">
                        <img src="/assets/images/logolionsgeek.png" alt="LionsGeek" className="h-7 w-7" />
                        <span className="font-medium">LionsGeek</span>
                    </div>
                    <nav className="flex items-center gap-2">
                        <Link
                            href={login()}
                            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-[var(--color-alpha)] text-black border border-transparent transition-colors hover:bg-black hover:text-[var(--color-alpha)]"
                        >
                            Log in
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden">
                    {/* Dark mode glow now handled globally */}
                    {/* Light mode: no gradient background */}

                    <div className="mx-auto grid min-h-[72svh] w-full items-center gap-10 px-4 py-16 md:max-w-7xl md:grid-cols-2">
                        <div className="relative z-10 space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border/70 px-3 py-1 text-xs text-muted-foreground">
                                <span className="inline-block size-2 rounded-full bg-[var(--color-alpha)]" />
                                Bookings made easy
                            </div>
                            <h1 className="text-3xl font-medium leading-tight sm:text-5xl">
                                Reserve studios, equipment and co‑work in minutes.
                            </h1>
                            <p className="max-w-prose text-balance text-muted-foreground">
                                LionsGeek gives you fast access to shared spaces and pro gear — from studios to co‑work —
                                with real‑time availability and a frictionless booking flow.
                            </p>
                            <ul className="mt-2 grid max-w-2xl grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-[var(--color-alpha)]" />Real‑time availability</li>
                                <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-[var(--color-alpha)]" />One‑tap rebooking</li>
                                <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-[var(--color-alpha)]" />Smart reminders & notifications</li>
                                <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-[var(--color-alpha)]" />Pickup & return checklist</li>
                            </ul>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium bg-[var(--color-alpha)] text-black border border-transparent transition-colors hover:bg-black hover:text-[var(--color-alpha)]"
                                >
                                    Get started
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-6 text-sm text-muted-foreground sm:flex sm:flex-row sm:gap-8">
                                <div>
                                    <div className="text-foreground text-xl font-semibold">5k+</div>
                                    Successful bookings
                                </div>
                                <div>
                                    <div className="text-foreground text-xl font-semibold">120+</div>
                                    Items of pro equipment
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-center justify-center">
                            <img
                                src="/assets/images/landing-page.svg"
                                alt="Students collaborating"
                                className="h-[260px] w-auto md:h-[380px]"
                                loading="eager"
                            />
                        </div>
                    </div>
                </section>
                {/* Highlights removed intentionally for a cleaner landing */}
            </main>

            <footer className="mt-12 border-t border-sidebar-border/70 py-8">
                <div className="mx-auto flex w-full items-center justify-end px-4 text-sm text-muted-foreground md:max-w-7xl">
                    <span>© {new Date().getFullYear()} LionsGeek</span>
                </div>
            </footer>
        </div>
    );
}


