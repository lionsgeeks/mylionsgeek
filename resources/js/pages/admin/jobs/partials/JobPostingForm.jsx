import JobDescriptionEditor from '@/components/JobDescriptionEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrganisationMultiSelect from '@/pages/admin/jobs/partials/OrganisationMultiSelect';
import { formatJobTypeLabel } from '@/pages/students/Jobs/partials/jobHelpers';
import { Link } from '@inertiajs/react';

export default function JobPostingForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    jobTypeOptions = [],
    organizationOptions = [],
    showOrganisationSelect = true,
    cancelHref,
    onCancel,
    reference = null,
    submitLabel = 'Save posting',
    embedInModal = false,
}) {
    const skillsValue = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills ?? '');

    return (
        <form onSubmit={onSubmit} className={embedInModal ? 'mt-4 space-y-4' : 'mt-6 space-y-4'}>
            {reference && (
                <p className="font-mono text-sm text-muted-foreground">
                    Reference: <span className="text-foreground">{reference}</span>
                </p>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="border-alpha/30 dark:border-light/15"
                    required
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <JobDescriptionEditor
                id="description"
                label="Description"
                value={data.description}
                onChange={(html) => setData('description', html)}
                error={errors.description}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={data.location ?? ''}
                        onChange={(e) => setData('location', e.target.value)}
                        className="border-alpha/30 dark:border-light/15"
                    />
                    {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Job type</Label>
                    <Select value={data.job_type} onValueChange={(v) => setData('job_type', v)}>
                        <SelectTrigger className="border-alpha/30 dark:border-light/15">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {jobTypeOptions.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {formatJobTypeLabel(t)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.job_type && <p className="text-sm text-red-600">{errors.job_type}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                    id="skills"
                    value={skillsValue}
                    onChange={(e) => setData('skills', e.target.value)}
                    placeholder="React, Laravel, SQL"
                    className="border-alpha/30 dark:border-light/15"
                />
                {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
            </div>

            {showOrganisationSelect && (
                <OrganisationMultiSelect
                    organizationOptions={organizationOptions}
                    selectedIds={data.organization_ids}
                    onChange={(ids) => setData('organization_ids', ids)}
                    error={errors.organization_ids}
                />
            )}

            <div className="space-y-2">
                <Label htmlFor="application_deadline">Application deadline</Label>
                <Input
                    id="application_deadline"
                    type="date"
                    value={data.application_deadline ?? ''}
                    onChange={(e) => setData('application_deadline', e.target.value)}
                    className="border-alpha/30 dark:border-light/15"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Students can apply through this date (inclusive). After it passes, the job is hidden from the job board.
                </p>
                {errors.application_deadline && <p className="text-sm text-red-600">{errors.application_deadline}</p>}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="is_published" checked={data.is_published} onCheckedChange={(c) => setData('is_published', c === true)} />
                <Label htmlFor="is_published" className="text-sm font-normal">
                    Publish on the student job board
                </Label>
            </div>
            {errors.is_published && <p className="text-sm text-red-600">{errors.is_published}</p>}

            <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={processing} className="bg-alpha text-black hover:bg-alpha/90">
                    {processing ? 'Saving…' : submitLabel}
                </Button>
                {onCancel ? (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : (
                    <Button type="button" variant="outline" asChild>
                        <Link href={cancelHref}>Cancel</Link>
                    </Button>
                )}
            </div>
        </form>
    );
}
