import RecruiterWorkspaceBanner from '@/components/recruiter/RecruiterWorkspaceBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import AdminCreateJobDialog from '@/pages/admin/jobs/partials/AdminCreateJobDialog';
import AdminEditJobDialog from '@/pages/admin/jobs/partials/AdminEditJobDialog';
import { formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';
import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function RecruiterJobsIndex({ jobs, jobTypeOptions = [] }) {
    const list = jobs ?? [];
    const [createOpen, setCreateOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    return (
        <AppLayout>
            <Head title="Assigned job postings" />
            <div className="flex flex-col gap-6 p-6">
                <RecruiterWorkspaceBanner />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-beta dark:text-light">Job postings</h1>
                        <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                            Create job postings and review applications from the Applications page.
                        </p>
                    </div>
                    <Button className="bg-alpha text-black hover:bg-alpha/90" size="sm" onClick={() => setCreateOpen(true)}>
                        New job posting
                    </Button>
                </div>

                <AdminCreateJobDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    jobTypeOptions={jobTypeOptions}
                    actionUrl="/recruiter/jobs"
                    showOrganisationSelect={false}
                />
                <AdminEditJobDialog
                    open={jobToEdit !== null}
                    onOpenChange={(next) => {
                        if (!next) {
                            setJobToEdit(null);
                        }
                    }}
                    job={jobToEdit}
                    jobTypeOptions={jobTypeOptions}
                    updateUrl={jobToEdit ? `/recruiter/jobs/${jobToEdit.id}` : undefined}
                    showOrganisationSelect={false}
                />

                {list.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">You have no jobs postings yet.</p>
                        {/* <p className="mt-2 text-sm text-muted-foreground">An administrator will assign you when they publish a job.</p> */}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/15 bg-white shadow-sm dark:border-light/10 dark:bg-dark_gray">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Applications</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead>Public view</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-mono text-sm font-medium">{job.reference}</TableCell>
                                        <TableCell className="max-w-[220px] font-medium">
                                            <span className="line-clamp-2">{job.title}</span>
                                        </TableCell>
                                        <TableCell>{formatJobTypeLabel(job.job_type)}</TableCell>
                                        <TableCell>{job.applications_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    job.is_published
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                                                }
                                            >
                                                {job.is_published ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {job.is_published ? (
                                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-alpha" asChild>
                                                    <a href={`/students/jobs/${job.id}`} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                        View
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setJobToEdit(job)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
