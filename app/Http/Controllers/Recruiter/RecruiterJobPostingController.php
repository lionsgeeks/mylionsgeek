<?php

namespace App\Http\Controllers\Recruiter;

use App\Actions\JobPostings\DeleteJobPosting;
use App\Actions\JobPostings\SaveJobPosting;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostingRequest;
use App\Models\Job;
use Illuminate\Http\RedirectResponse;

class RecruiterJobPostingController extends Controller
{
    public function store(JobPostingRequest $request, SaveJobPosting $saveJobPosting): RedirectResponse
    {
        $validated = $request->validated();

        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId || ! $request->user()->canCreateJobsForOrganisation()) {
            abort(403);
        }

        $saveJobPosting->create($validated, (int) $request->user()->id, [$organizationId]);

        return redirect()->route('recruiter.jobs.index')->with('success', 'Job posting created.');
    }

    public function update(JobPostingRequest $request, Job $job, SaveJobPosting $saveJobPosting): RedirectResponse
    {
        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId || ! $request->user()->canCreateJobsForOrganisation()) {
            abort(403);
        }

        if (! $job->organizations()->where('organizations.id', $organizationId)->exists()) {
            abort(403);
        }

        $validated = $request->validated();
        $saveJobPosting->update($job, $validated, [$organizationId]);

        return redirect()->route('recruiter.jobs.index')->with('success', 'Job posting updated.');
    }

    public function destroy(Job $job, DeleteJobPosting $deleteJobPosting): RedirectResponse
    {
        $organizationId = request()->user()->organizationIdForRecruiting();
        if (! $organizationId || ! request()->user()->canCreateJobsForOrganisation()) {
            abort(403);
        }

        if (! $job->organizations()->where('organizations.id', $organizationId)->exists()) {
            abort(403);
        }

        try {
            $deleteJobPosting->delete($job);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $message = $e->validator->errors()->first('job') ?? __('Unable to delete this job posting.');

            return redirect()->route('recruiter.jobs.index')->with('error', $message);
        }

        return redirect()->route('recruiter.jobs.index')->with('success', 'Job posting deleted.');
    }
}
