<?php

namespace App\Http\Controllers\Recruiter;

use App\Actions\JobPostings\SaveJobPosting;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostingRequest;
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

        // Recruiters may create jobs for their organisation only.
        $saveJobPosting->create($validated, (int) $request->user()->id, [$organizationId]);

        return redirect()->route('recruiter.jobs.index')->with('success', 'Job posting created.');
    }
}

