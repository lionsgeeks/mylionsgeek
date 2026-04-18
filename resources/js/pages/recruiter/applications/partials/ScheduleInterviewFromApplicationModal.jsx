import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ScheduleInterviewFromApplicationModal({ open, onOpenChange, application, jobTitle }) {
    const form = useForm({
        title: '',
        group_label: '',
        starts_at: '',
        location: '',
        notes: '',
        job_application_id: null,
        redirect: 'interviews',
    });

    useEffect(() => {
        if (!open || !application) {
            return;
        }
        const applicantName = application.applicant?.name ?? 'Applicant';
        const job = jobTitle ?? 'Job';
        form.setData({
            title: `Interview — ${applicantName} · ${job}`,
            group_label: '',
            starts_at: '',
            location: '',
            notes: '',
            job_application_id: application.id,
            redirect: 'interviews',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-init when opening for a row
    }, [open, application?.id, application?.applicant?.name, jobTitle]);

    const handleClose = () => {
        form.reset();
        form.clearErrors();
        onOpenChange(false);
    };

    const submit = (e) => {
        e.preventDefault();
        form.transform((formData) => ({
            ...formData,
            group_label: formData.group_label?.trim() ? formData.group_label : null,
            notes: formData.notes?.trim() ? formData.notes : null,
        }));
        form.post('/recruiter/interviews', {
            preserveScroll: true,
            onFinish: () => {
                form.transform((d) => d);
            },
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-alpha/15 bg-light sm:max-w-md dark:border-light/10 dark:bg-dark">
                <DialogHeader>
                    <DialogTitle>Add to interview calendar</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="sched-int-title">Title</Label>
                        <Input
                            id="sched-int-title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            className="border-alpha/30 dark:border-light/15"
                        />
                        {form.errors.title && <p className="text-sm text-destructive">{form.errors.title}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sched-int-start">Date and time</Label>
                        <Input
                            id="sched-int-start"
                            type="datetime-local"
                            value={form.data.starts_at}
                            onChange={(e) => form.setData('starts_at', e.target.value)}
                            className="border-alpha/30 dark:border-light/15"
                            required
                        />
                        {form.errors.starts_at && <p className="text-sm text-destructive">{form.errors.starts_at}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sched-int-location">Location</Label>
                        <Input
                            id="sched-int-location"
                            value={form.data.location}
                            onChange={(e) => form.setData('location', e.target.value)}
                            placeholder="Address, room, or video meeting link"
                            className="border-alpha/30 dark:border-light/15"
                        />
                        {form.errors.location && <p className="text-sm text-destructive">{form.errors.location}</p>}
                    </div>
                    {form.errors.job_application_id && <p className="text-sm text-destructive">{form.errors.job_application_id}</p>}
                    <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.title?.trim() || !form.data.starts_at}
                            className="bg-alpha text-black hover:bg-alpha/90"
                        >
                            {form.processing ? 'Saving…' : 'Add to calendar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
