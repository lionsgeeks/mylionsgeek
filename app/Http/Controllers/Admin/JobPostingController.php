<?php

namespace App\Http\Controllers\Admin;

use App\Actions\JobPostings\SaveJobPosting;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostingRequest;
use App\Models\Job;
use App\Models\User;
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
                'recruiters:id,name,email',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Job $job) => $this->serializeJobForAdminList($job));

        return Inertia::render('admin/jobs/index', [
            'jobs' => $jobs,
            'recruiterOptions' => $this->recruiterOptions(),
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
        $recruiterIds = $validated['recruiter_ids'] ?? [];
        $saveJobPosting->create($validated, (int) $request->user()->id, $recruiterIds);

        return redirect()->route('admin.jobs.index')->with('success', 'Job posting created.');
    }

    public function update(JobPostingRequest $request, Job $job, SaveJobPosting $saveJobPosting): RedirectResponse
    {
        $validated = $request->validated();
        $recruiterIds = $validated['recruiter_ids'] ?? [];
        $saveJobPosting->update($job, $validated, $recruiterIds);

        return redirect()->route('admin.jobs.index')->with('success', 'Job posting updated.');
    }

    /**
     * @return array<int, array{id: int, name: string, email: string}>
     */
    private function recruiterOptions(): array
    {
        return User::query()
            ->whereJsonContains('role', 'recruiter')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => (int) $user->id,
                'name' => $user->name,
                'email' => $user->email,
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
            'skills' => $job->skills ?? [],
            'recruiter_ids' => $job->recruiters->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            'created_at' => $job->created_at?->toIso8601String(),
            'creator' => $job->creator ? [
                'id' => $job->creator->id,
                'name' => $job->creator->name,
                'email' => $job->creator->email,
            ] : null,
            'recruiters' => $job->recruiters->map(fn (User $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'email' => $r->email,
            ])->values()->all(),
        ];
    }
}
