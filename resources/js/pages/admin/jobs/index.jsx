import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import students from '../../../../../public/assets/images/banner/students.png';
import AdminCreateJobDialog from './partials/AdminCreateJobDialog';
import AdminEditJobDialog from './partials/AdminEditJobDialog';
import DeleteJobPostingDialog from './partials/DeleteJobPostingDialog';
import JobsAdminFilter from './partials/JobsAdminFilter';
import JobsAdminHeader from './partials/JobsAdminHeader';
import JobsAdminTable from './partials/JobsAdminTable';

const defaultFilters = {
    search: '',
    published: 'all',
    job_type: '',
};

export default function AdminJobsIndex({ jobs, organizationOptions = [], jobTypeOptions = [] }) {
    const { auth, flash } = usePage().props;
    const [filters, setFilters] = useState(defaultFilters);
    const [createJobOpen, setCreateJobOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [flashBanner, setFlashBanner] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashBanner({ type: flash.success ? 'success' : 'error', message: flash.success ?? flash.error });
        }
    }, [flash?.success, flash?.error]);

    const jobTypes = useMemo(() => {
        const set = new Set(jobs.map((j) => j.job_type).filter(Boolean));
        return [...set].sort();
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        const q = filters.search.trim().toLowerCase();
        return jobs.filter((job) => {
            if (q) {
                const inTitle = (job.title || '').toLowerCase().includes(q);
                const inRef = (job.reference || '').toLowerCase().includes(q);
                if (!inTitle && !inRef) return false;
            }
            if (filters.published === 'published' && !job.is_published) return false;
            if (filters.published === 'draft' && job.is_published) return false;
            if (filters.job_type && job.job_type !== filters.job_type) return false;
            return true;
        });
    }, [jobs, filters]);

    return (
        <AppLayout>
            <div className="flex flex-col gap-10 p-6">
                <Banner
                    illustration={students}
                    userName={auth?.user?.name ?? ''}
                    title="Job postings"
                    description="Create postings, assign organisations to each offer, and review what appears on the student job board."
                />
                {flashBanner && (
                    <div
                        className={
                            flashBanner.type === 'success'
                                ? 'rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200'
                                : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
                        }
                    >
                        {flashBanner.message}
                    </div>
                )}
                <JobsAdminHeader filteredJobs={jobs} onOpenCreateJob={() => setCreateJobOpen(true)} />
                <AdminCreateJobDialog
                    open={createJobOpen}
                    onOpenChange={setCreateJobOpen}
                    organizationOptions={organizationOptions}
                    jobTypeOptions={jobTypeOptions}
                />
                <AdminEditJobDialog
                    open={jobToEdit !== null}
                    onOpenChange={(next) => {
                        if (!next) {
                            setJobToEdit(null);
                        }
                    }}
                    job={jobToEdit}
                    organizationOptions={organizationOptions}
                    jobTypeOptions={jobTypeOptions}
                />
                <DeleteJobPostingDialog
                    open={jobToDelete !== null}
                    onOpenChange={(next) => {
                        if (!next) {
                            setJobToDelete(null);
                        }
                    }}
                    job={jobToDelete}
                    deleteUrl={jobToDelete ? `/admin/jobs/${jobToDelete.id}` : undefined}
                />
                <JobsAdminFilter filters={filters} setFilters={setFilters} jobTypes={jobTypes} initialFilters={defaultFilters} />
                <JobsAdminTable jobs={filteredJobs} onEditJob={setJobToEdit} onDeleteJob={setJobToDelete} />
            </div>
        </AppLayout>
    );
}
