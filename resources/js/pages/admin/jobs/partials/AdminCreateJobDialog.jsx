import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobPostingForm from '@/pages/admin/jobs/partials/JobPostingForm';
import { defaultApplicationDeadline } from '@/pages/students/Jobs/partials/jobHelpers';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';

const EMPTY_ORGANIZATION_IDS = [];

function buildDefaults(jobTypeOptions) {
    return {
        title: '',
        description: '',
        location: '',
        job_type: jobTypeOptions[0] ?? 'full_time',
        skills: '',
        application_deadline: defaultApplicationDeadline(),
        is_published: true,
        organization_ids: [],
    };
}

export default function AdminCreateJobDialog({
    open,
    onOpenChange,
    organizationOptions = [],
    jobTypeOptions = [],
    actionUrl = '/admin/jobs',
    showOrganisationSelect = true,
    defaultOrganizationIds = EMPTY_ORGANIZATION_IDS,
}) {
    const { data, setData, post, processing, errors } = useForm(buildDefaults(jobTypeOptions));

    const defaultOrgIdsKey = useMemo(
        () => (Array.isArray(defaultOrganizationIds) ? defaultOrganizationIds.map(Number).join(',') : ''),
        [defaultOrganizationIds],
    );
    const wasOpenRef = useRef(false);

    useEffect(() => {
        const justOpened = open && !wasOpenRef.current;
        wasOpenRef.current = open;
        if (!justOpened) {
            return;
        }
        const d = buildDefaults(jobTypeOptions);
        if (defaultOrgIdsKey) {
            d.organization_ids = defaultOrgIdsKey.split(',').map(Number);
        }
        Object.keys(d).forEach((key) => setData(key, d[key]));
    }, [open, jobTypeOptions, setData, defaultOrgIdsKey]);

    const submit = (e) => {
        e.preventDefault();
        post(actionUrl, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton className="max-h-[min(92vh,56rem)] w-[calc(100%-1.5rem)] max-w-5xl gap-0 overflow-hidden p-0 sm:w-full">
                <div className="max-h-[min(92vh,56rem)] overflow-y-auto p-6">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl">New job posting</DialogTitle>
                        <DialogDescription>
                            Create the role, publish when ready, and assign one or more organisations to review applicants.
                        </DialogDescription>
                    </DialogHeader>
                    <JobPostingForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        jobTypeOptions={jobTypeOptions}
                        organizationOptions={organizationOptions}
                        showOrganisationSelect={showOrganisationSelect}
                        onCancel={handleCancel}
                        submitLabel="Create posting"
                        embedInModal
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
