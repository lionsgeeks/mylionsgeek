import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronsLeft, ChevronsRight, ExternalLink, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatApplicationDeadline, formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';

export default function JobsAdminTable({ jobs, onEditJob }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(jobs.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = jobs.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [jobs]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Created by</TableHead>
                        <TableHead>Organisations</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell className="font-mono text-sm font-medium">{job.reference}</TableCell>
                            <TableCell className="max-w-[200px] font-medium">
                                <span className="line-clamp-2">{job.title}</span>
                            </TableCell>
                            <TableCell>{formatJobTypeLabel(job.job_type)}</TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                                {formatApplicationDeadline(job.application_deadline)}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        job.is_open_for_applications
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                                    }
                                >
                                    {job.is_open_for_applications ? 'Live' : job.is_published ? 'Expired' : 'Draft'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                                {job.creator ? (
                                    <span>
                                        {job.creator.name}
                                        <span className="mt-0.5 block text-xs text-muted-foreground">{job.creator.email}</span>
                                    </span>
                                ) : (
                                    '—'
                                )}
                            </TableCell>
                            <TableCell className="max-w-[200px] text-sm">
                                {job.organizations?.length ? (
                                    <span className="line-clamp-3">{job.organizations.map((r) => r.name).join(', ')}</span>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-alpha" onClick={() => onEditJob(job)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-alpha" asChild>
                                        <a href={`/students/jobs/${job.id}`} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            View
                                        </a>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-10 flex w-full items-center justify-center gap-5">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-40 dark:bg-light dark:text-dark"
                >
                    <ChevronsLeft />
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-40 dark:bg-light dark:text-dark"
                >
                    <ChevronsRight />
                </button>
            </div>
        </div>
    );
}
