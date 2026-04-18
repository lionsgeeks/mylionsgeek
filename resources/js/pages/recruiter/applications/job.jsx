import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import ScheduleInterviewFromApplicationModal from '@/pages/recruiter/applications/partials/ScheduleInterviewFromApplicationModal';
import { formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import { useState } from 'react';

const INTERVIEW_SLOT_MINUTES = 30;

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

function isInterviewSlotEnded(startsAtIso, slotMinutes = INTERVIEW_SLOT_MINUTES) {
    if (!startsAtIso) return false;
    const start = new Date(startsAtIso);
    if (Number.isNaN(start.getTime())) return false;
    const end = new Date(start.getTime() + slotMinutes * 60 * 1000);
    return Date.now() >= end.getTime();
}

function applicantProfileHref(applicantId) {
    return `/recruiter/students/${applicantId}`;
}

export default function RecruiterApplicationsJob({ job, applications }) {
    const list = applications ?? [];
    const { errors } = usePage().props;
    const profileBase = (applicantId) => (applicantId ? applicantProfileHref(applicantId) : null);
    const [scheduleForApplication, setScheduleForApplication] = useState(null);
    const [pendingDeleteInterviewId, setPendingDeleteInterviewId] = useState(null);
    const [outcomeBusyInterviewId, setOutcomeBusyInterviewId] = useState(null);
    const [lastOutcomeAttemptInterviewId, setLastOutcomeAttemptInterviewId] = useState(null);

    const submitInterviewOutcome = (interviewId, outcome) => {
        router.patch(
            `/recruiter/interviews/${interviewId}/outcome`,
            { outcome },
            {
                preserveScroll: true,
                onStart: () => {
                    setOutcomeBusyInterviewId(interviewId);
                    setLastOutcomeAttemptInterviewId(interviewId);
                },
                onFinish: () => setOutcomeBusyInterviewId(null),
                onSuccess: () => setLastOutcomeAttemptInterviewId(null),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={job?.title ? `${job.title} · Applications` : 'Applications'} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Button variant="ghost" size="sm" className="-ml-2 mb-2 gap-1 text-alpha" asChild>
                            <Link href="/recruiter/applications">
                                <ArrowLeft className="h-4 w-4" />
                                All jobs
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-beta dark:text-light">{job?.title ?? 'Job'}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-beta/75 dark:text-light/75">
                            <Badge className="bg-alpha/15 font-normal text-black dark:bg-alpha/25 dark:text-black">
                                {formatJobTypeLabel(job?.job_type)}
                            </Badge>
                            {job?.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/recruiter/dashboard">Dashboard</Link>
                    </Button>
                </div>

                {list.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">No applications for this job yet.</p>
                        <p className="mt-2 text-sm text-beta/70 dark:text-light/70">Students will appear here after they apply.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/15 bg-white shadow-sm dark:border-light/10 dark:bg-dark_gray">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    {/* <TableHead>Subject</TableHead> */}
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead className="w-[120px]">Profile</TableHead>
                                    <TableHead className="w-[120px]">CV</TableHead>
                                    <TableHead className="min-w-[168px]">Interview</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((row) => {
                                    const applicantId = row.applicant?.id;
                                    const interview = row.recruiter_interview;
                                    const scheduleInterviewId = interview?.id ?? null;
                                    const interviewOutcome = interview?.outcome ?? null;
                                    const interviewStartsAt = interview?.starts_at ?? null;
                                    const slotEnded = interviewStartsAt ? isInterviewSlotEnded(interviewStartsAt) : false;
                                    const href = profileBase(applicantId);
                                    const profileLinkClass =
                                        'block min-h-[48px] rounded-md px-3 py-3 text-left transition-colors hover:bg-alpha/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alpha dark:hover:bg-light/[0.08]';

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell className="p-0 align-center">
                                                {href ? (
                                                    <Link href={href} className={profileLinkClass}>
                                                        {row.applicant ? (
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    image={row.applicant.image}
                                                                    name={row.applicant.name}
                                                                    className="h-9 w-9 shrink-0"
                                                                    onlineCircleClass="hidden"
                                                                />
                                                                <div className="min-w-0">
                                                                    <span className="font-medium text-beta dark:text-light">{row.applicant.name}</span>
                                                                    <span className="mt-0.5 block truncate text-xs text-beta/65 dark:text-light/65">
                                                                        {row.applicant.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="px-3 py-3">
                                                        {row.applicant ? (
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    image={row.applicant.image}
                                                                    name={row.applicant.name}
                                                                    className="h-9 w-9 shrink-0"
                                                                    onlineCircleClass="hidden"
                                                                />
                                                                <span className="font-medium text-beta dark:text-light">{row.applicant.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            {/* <TableCell className="max-w-[200px] p-0 align-center text-sm font-medium">
                                                {href ? (
                                                    <Link href={href} className={profileLinkClass}>
                                                        {row.subject ?? '—'}
                                                    </Link>
                                                ) : (
                                                    <div className="px-3 py-3">{row.subject ?? '—'}</div>
                                                )}
                                            </TableCell> */}
                                            <TableCell className="p-0 align-center">
                                                {href ? (
                                                    <Link href={href} className={`${profileLinkClass} flex items-start`}>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {row.status ?? 'pending'}
                                                        </Badge>
                                                    </Link>
                                                ) : (
                                                    <div className="px-3 py-3">
                                                        <Badge variant="secondary" className="capitalize">
                                                            {row.status ?? 'pending'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="p-0 align-center text-sm">
                                                {href ? (
                                                    <Link href={href} className={profileLinkClass}>
                                                        {formatDate(row.created_at)}
                                                    </Link>
                                                ) : (
                                                    <div className="px-3 py-3">{formatDate(row.created_at)}</div>
                                                )}
                                            </TableCell>
                                            {/* <TableCell className="max-w-md p-0 align-center text-sm text-beta/85 dark:text-light/85">
                                                {href ? (
                                                    <Link href={href} className={profileLinkClass}>
                                                        {row.cover_letter ? (
                                                            <span className="line-clamp-4 whitespace-pre-wrap">{row.cover_letter}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="px-3 py-3">
                                                        {row.cover_letter ? (
                                                            <span className="line-clamp-4 whitespace-pre-wrap">{row.cover_letter}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell> */}
                                            <TableCell className="p-0 align-center">
                                                <div className="flex min-h-[48px] flex-col justify-center gap-2 px-3 py-3">
                                                    {href ? (
                                                        <Link href={href} className="bg-alpha text-black px-5 py-1.5 rounded-md text-center">
                                                            View profile
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-0 align-center">
                                                <div className="flex min-h-[48px] flex-col justify-center gap-2 px-3 py-3">
                                                    {row.has_cv ? (
                                                        <Button size="sm" className="bg-alpha text-black px-5 py-1.5 rounded-md text-center" asChild>
                                                            <a href={`/recruiter/applications/${row.id}/cv`} target='_blank'>
                                                                <Download className="h-3.5 w-3.5" />
                                                                Open CV
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No CV</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-0 align-center">
                                                <div className="flex min-h-[48px] flex-col justify-center gap-2 px-3 py-3">
                                                    {!scheduleInterviewId ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="bg-alpha px-5 py-1.5 text-center text-black"
                                                            onClick={() => setScheduleForApplication(row)}
                                                        >
                                                            Add Schedule
                                                        </Button>
                                                    ) : interviewOutcome ? (
                                                        <div className="flex flex-col gap-1.5">
                                                            <Badge
                                                                variant="secondary"
                                                                className={
                                                                    interviewOutcome === 'accepted'
                                                                        ? 'w-fit border border-green-600/40 bg-green-600/15 capitalize text-green-800 dark:text-green-200'
                                                                        : 'w-fit border border-destructive/40 bg-destructive/10 capitalize text-destructive'
                                                                }
                                                            >
                                                                {interviewOutcome}
                                                            </Badge>
                                                            <span className="text-xs text-beta/65 dark:text-light/65">
                                                                {formatDate(interviewStartsAt)}
                                                            </span>
                                                        </div>
                                                    ) : slotEnded ? (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={outcomeBusyInterviewId === scheduleInterviewId}
                                                                    className="bg-alpha px-3 text-black"
                                                                    onClick={() =>
                                                                        submitInterviewOutcome(scheduleInterviewId, 'accepted')
                                                                    }
                                                                >
                                                                    Accepted
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="px-3"
                                                                    disabled={outcomeBusyInterviewId === scheduleInterviewId}
                                                                    onClick={() =>
                                                                        submitInterviewOutcome(scheduleInterviewId, 'rejected')
                                                                    }
                                                                >
                                                                    Rejected
                                                                </Button>
                                                            </div>
                                                            {lastOutcomeAttemptInterviewId === scheduleInterviewId &&
                                                            errors?.outcome ? (
                                                                <p className="text-xs text-destructive">{errors.outcome}</p>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs text-beta/75 dark:text-light/75">
                                                                Scheduled · {formatDate(interviewStartsAt)}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="px-5 py-1.5 text-center"
                                                                onClick={() => setPendingDeleteInterviewId(scheduleInterviewId)}
                                                            >
                                                                Delete Schedule
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {list.length > 0 && (
                    <p className="text-center text-xs text-beta/60 dark:text-light/60">
                        Applicant, subject, status, applied date, and description open the student profile. Use Download CV for the file only.
                    </p>
                )}
            </div>
            <ScheduleInterviewFromApplicationModal
                open={!!scheduleForApplication}
                onOpenChange={(open) => !open && setScheduleForApplication(null)}
                application={scheduleForApplication}
                jobTitle={job?.title}
            />

            <AlertDialog open={pendingDeleteInterviewId !== null} onOpenChange={(o) => !o && setPendingDeleteInterviewId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The applicant will no longer have this slot on your calendar. You can schedule a new time afterwards.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (pendingDeleteInterviewId == null) return;
                                router.delete(`/recruiter/interviews/${pendingDeleteInterviewId}`, {
                                    preserveScroll: true,
                                    onFinish: () => setPendingDeleteInterviewId(null),
                                });
                            }}
                        >
                            Delete schedule
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
