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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

function toDatetimeLocalValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** FullCalendar needs an end; events are shown as 30 minutes from start. */
function isoAddMinutes(iso, minutes) {
    if (!iso) return iso;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
}

const emptyForm = {
    title: '',
    group_label: '',
    starts_at: '',
    location: '',
    notes: '',
    job_application_id: '',
};

export default function RecruiterInterviewsIndex({ interviews = [], applicationOptions = [] }) {
    const { flash } = usePage().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [processing, setProcessing] = useState(false);

    const events = useMemo(
        () =>
            interviews.map((row) => ({
                id: String(row.id),
                title: row.group_label ? `${row.group_label} · ${row.title}` : row.title,
                start: row.starts_at,
                end: isoAddMinutes(row.starts_at, 30),
                extendedProps: row,
            })),
        [interviews],
    );

    const openCreate = useCallback((dateStr) => {
        setEditingId(null);
        const start = dateStr ? `${dateStr}T09:00` : '';
        setForm({
            ...emptyForm,
            starts_at: start,
        });
        setDialogOpen(true);
    }, []);

    const openEdit = useCallback((row) => {
        setEditingId(row.id);
        setForm({
            title: row.title ?? '',
            group_label: row.group_label ?? '',
            starts_at: toDatetimeLocalValue(row.starts_at),
            location: row.location ?? '',
            notes: row.notes ?? '',
            job_application_id: row.job_application_id ? String(row.job_application_id) : '',
        });
        setDialogOpen(true);
    }, []);

    const submit = () => {
        setProcessing(true);
        const payload = {
            title: form.title,
            group_label: form.group_label || null,
            starts_at: form.starts_at,
            location: form.location?.trim() ? form.location.trim() : null,
            notes: form.notes || null,
            job_application_id: form.job_application_id ? parseInt(form.job_application_id, 10) : null,
        };

        const done = () => {
            setProcessing(false);
            setDialogOpen(false);
        };

        if (editingId) {
            router.put(`/recruiter/interviews/${editingId}`, payload, {
                preserveScroll: true,
                onFinish: done,
            });
        } else {
            router.post('/recruiter/interviews', payload, {
                preserveScroll: true,
                onFinish: done,
            });
        }
    };

    const linkedApplication = Boolean(form.job_application_id);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(`/recruiter/interviews/${deleteTarget}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteTarget(null);
                setDialogOpen(false);
                setEditingId(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Interview calendar" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-beta dark:text-light">Interview calendar</h1>
                        <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                            Group interviews with a shared label, link an application, or click a slot to schedule.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/recruiter/dashboard">Dashboard</Link>
                        </Button>
                        <Button className="bg-alpha text-black hover:bg-alpha/90" size="sm" onClick={() => openCreate(null)}>
                            New interview
                        </Button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-lg border border-alpha/15 bg-white p-3 dark:border-light/10 dark:bg-dark_gray">
                    <div className="min-h-[560px]">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            height="auto"
                            slotDuration="00:30:00"
                            allDaySlot={false}
                            editable={false}
                            selectable={false}
                            events={events}
                            dateClick={(info) => openCreate(info.dateStr)}
                            eventClick={(info) => {
                                const row = info.event.extendedProps;
                                if (row?.id) openEdit(row);
                            }}
                        />
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto border-alpha/15 bg-light sm:max-w-md dark:border-light/10 dark:bg-dark">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit interview' : 'Schedule interview'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="int-title">
                                    Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="int-title"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="border-alpha/30 dark:border-light/15"
                                    required
                                    aria-required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="int-group">Group label (optional)</Label>
                                <Input
                                    id="int-group"
                                    value={form.group_label}
                                    onChange={(e) => setForm((f) => ({ ...f, group_label: e.target.value }))}
                                    placeholder="e.g. Spring batch — front-end"
                                    className="border-alpha/30 dark:border-light/15"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="int-start">
                                    Starts <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="int-start"
                                    type="datetime-local"
                                    value={form.starts_at}
                                    onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                                    className="border-alpha/30 dark:border-light/15"
                                    required
                                    aria-required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be in the future, start between 7:00–19:00 (app timezone), and not overlap your calendar or another interview
                                    for the same job.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="int-location">
                                    Location
                                    {linkedApplication ? <span className="text-destructive"> *</span> : ' (optional)'}
                                </Label>
                                <Input
                                    id="int-location"
                                    value={form.location}
                                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="e.g. LionsGeek HQ, Room 2, or video link"
                                    className="border-alpha/30 dark:border-light/15"
                                    required={linkedApplication}
                                    aria-required={linkedApplication}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Link application (optional)</Label>
                                <Select
                                    value={form.job_application_id || '__none__'}
                                    onValueChange={(v) => setForm((f) => ({ ...f, job_application_id: v === '__none__' ? '' : v }))}
                                >
                                    <SelectTrigger className="border-alpha/30 dark:border-light/15">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">None</SelectItem>
                                        {applicationOptions.map((opt) => (
                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="int-notes">Notes</Label>
                                <Textarea
                                    id="int-notes"
                                    rows={3}
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    className="border-alpha/30 dark:border-light/15"
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                            {editingId ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="sm:mr-auto"
                                    onClick={() => {
                                        setDeleteTarget(editingId);
                                    }}
                                >
                                    Delete
                                </Button>
                            ) : (
                                <span />
                            )}
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={processing || !form.title.trim() || !form.starts_at || (linkedApplication && !form.location?.trim())}
                                    className="bg-alpha text-black hover:bg-alpha/90"
                                    onClick={submit}
                                >
                                    {processing ? 'Saving…' : editingId ? 'Save' : 'Create'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove this interview?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
