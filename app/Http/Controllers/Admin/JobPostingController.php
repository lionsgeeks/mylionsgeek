<?php

namespace App\Http\Controllers\Admin;

use App\Actions\JobPostings\SaveJobPosting;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostingRequest;
use App\Models\Job;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingController extends Controller
{
    public function index(): Response
    {
        $jobs = Job::query()
            ->with([
                'creator:id,name,email',
                'organizations:id,email,enterprise_name,contact_name',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Job $job) => $this->serializeJobForAdminList($job));

        return Inertia::render('admin/jobs/index', [
            'jobs' => $jobs,
            'organizationOptions' => $this->organizationOptions(),
            'jobTypeOptions' => Job::JOB_TYPES,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('admin.jobs.index');
    }

    public function store(JobPostingRequest $request, SaveJobPosting $saveJobPosting): RedirectResponse
    {
        $validated = $request->validated();
        $organizationIds = $validated['organization_ids'] ?? [];
        $saveJobPosting->create($validated, (int) $request->user()->id, $organizationIds);

        return redirect()->route('admin.jobs.index')->with('success', 'Job posting created.');
    }

    public function update(JobPostingRequest $request, Job $job, SaveJobPosting $saveJobPosting): RedirectResponse
    {
        $validated = $request->validated();
        $organizationIds = $validated['organization_ids'] ?? [];
        $saveJobPosting->update($job, $validated, $organizationIds);

        return redirect()->route('admin.jobs.index')->with('success', 'Job posting updated.');
    }

    /**
     * @return array<int, array{id: int, name: string, email: string}>
     */
    private function organizationOptions(): array
    {
        return Organization::query()
            ->whereNotNull('onboarding_completed_at')
            ->orderBy('enterprise_name')
            ->orderBy('email')
            ->get()
            ->map(fn (Organization $org) => [
                'id' => (int) $org->id,
                'name' => $org->displayName(),
                'email' => $org->email,
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeJobForAdminList(Job $job): array
    {
        return [
            'id' => $job->id,
            'reference' => $job->reference,
            'title' => $job->title,
            'description' => $job->description,
            'job_type' => $job->job_type,
            'location' => $job->location,
            'is_published' => (bool) $job->is_published,
            'application_deadline' => $job->application_deadline?->format('Y-m-d'),
            'is_open_for_applications' => $job->isOpenForApplications(),
            'skills' => $job->skills ?? [],
            'organization_ids' => $job->organizations->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            'created_at' => $job->created_at?->toIso8601String(),
            'creator' => $job->creator ? [
                'id' => $job->creator->id,
                'name' => $job->creator->name,
                'email' => $job->creator->email,
            ] : null,
            'organizations' => $job->organizations->map(fn (Organization $org) => [
                'id' => $org->id,
                'name' => $org->displayName(),
                'email' => $org->email,
            ])->values()->all(),
        ];
    }
}
