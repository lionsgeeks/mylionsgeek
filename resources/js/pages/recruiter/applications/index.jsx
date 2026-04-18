import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, ChevronRight, MapPin } from 'lucide-react';

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
}

export default function RecruiterApplicationsIndex({ jobs }) {
    const list = jobs ?? [];

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-beta dark:text-light">Applications</h1>
                        <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                            Choose a job to view every application for that posting.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/recruiter/dashboard">Dashboard</Link>
                    </Button>
                </div>

                {list.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">You have no assigned jobs yet.</p>
                        <p className="mt-2 text-sm text-beta/70 dark:text-light/70">
                            When an administrator assigns you to a posting, it will appear here. You can also create jobs from{' '}
                            <Link href="/recruiter/jobs" className="font-medium text-alpha underline">
                                My jobs
                            </Link>
                            .
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {list.map((job) => (
                            <Link
                                key={job.id}
                                href={`/recruiter/applications/jobs/${job.id}`}
                                className="group flex flex-col rounded-lg border border-alpha/15 bg-white p-5 shadow-sm transition-colors hover:border-alpha/40 hover:bg-alpha/[0.03] dark:border-light/10 dark:bg-dark_gray dark:hover:border-light/25"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-alpha/15 text-beta dark:text-light">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold text-beta line-clamp-2 group-hover:text-alpha dark:text-light">{job.title}</h2>
                                            <p className="mt-1 font-mono text-xs text-beta/60 dark:text-light/60">{job.reference}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-beta/40 transition-transform group-hover:translate-x-0.5 group-hover:text-alpha dark:text-light/40" />
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-beta/75 dark:text-light/75">
                                    <Badge className="bg-alpha/15 font-normal text-black dark:bg-alpha/25 dark:text-black">
                                        {formatJobTypeLabel(job.job_type)}
                                    </Badge>
                                    {job.location && (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="line-clamp-1">{job.location}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-alpha/10 pt-4 dark:border-light/10">
                                    <span className="text-sm text-beta/80 dark:text-light/80">
                                        <span className="font-semibold text-beta dark:text-light">{job.applications_count ?? 0}</span>{' '}
                                        {job.applications_count === 1 ? 'application' : 'applications'}
                                    </span>
                                    <span className="text-xs text-beta/60 dark:text-light/60">Posted {formatDate(job.created_at)}</span>
                                </div>
                                {!job.is_published && (
                                    <Badge variant="secondary" className="mt-3 w-fit text-xs">
                                        Draft
                                    </Badge>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
