import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatApplicationStatusLabel, formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin } from 'lucide-react';

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

function statusBadgeClass(status) {
    if (status === 'accepted') {
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
    }
    if (status === 'rejected') {
        return 'bg-destructive/10 text-destructive';
    }
    if (status === 'under_review') {
        return 'bg-alpha/15 text-beta dark:text-light';
    }
    return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200';
}

export default function MyJobApplications({ applications }) {
    const list = applications ?? [];

    return (
        <AppLayout>
            <Head title="My applications" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1 text-alpha" asChild>
                        <Link href="/students/jobs">
                            <ArrowLeft className="h-4 w-4" />
                            Browse jobs
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-beta dark:text-light">My applications</h1>
                    <p className="mt-1 text-sm text-beta/70 dark:text-light/70">Track roles you have applied to and their status.</p>
                </div>

                {list.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">You have not applied to any jobs yet.</p>
                        <Button className="mt-4 bg-alpha text-black hover:bg-alpha/90" size="sm" asChild>
                            <Link href="/students/jobs">Browse open jobs</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/15 bg-white shadow-sm dark:border-light/10 dark:bg-dark_gray">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead>Interview</TableHead>
                                    <TableHead className="w-[100px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((row) => {
                                    const job = row.job;
                                    const interview = row.interview;

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="font-medium text-beta dark:text-light">{job?.title ?? '—'}</div>
                                                {job?.reference && (
                                                    <div className="mt-0.5 font-mono text-xs text-beta/60 dark:text-light/60">{job.reference}</div>
                                                )}
                                                {job?.location && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-beta/65 dark:text-light/65">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {job.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">{job ? formatJobTypeLabel(job.job_type) : '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={statusBadgeClass(row.status)}>
                                                    {formatApplicationStatusLabel(row.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{formatDate(row.created_at)}</TableCell>
                                            <TableCell className="text-sm">
                                                {interview?.starts_at ? (
                                                    <div>
                                                        <div>{formatDate(interview.starts_at)}</div>
                                                        {interview.location && (
                                                            <div className="text-xs text-beta/65 dark:text-light/65">{interview.location}</div>
                                                        )}
                                                        {interview.outcome && (
                                                            <Badge variant="secondary" className={`mt-1 capitalize ${statusBadgeClass(interview.outcome)}`}>
                                                                {formatApplicationStatusLabel(interview.outcome)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {job?.id && job.is_published ? (
                                                    <Button variant="ghost" size="sm" className="text-alpha" asChild>
                                                        <Link href={`/students/jobs/${job.id}`}>View</Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
