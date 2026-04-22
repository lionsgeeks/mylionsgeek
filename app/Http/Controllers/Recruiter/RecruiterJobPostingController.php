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

        // Recruiters may create jobs, but cannot assign other recruiters.
        // We always assign the creating recruiter to the posting.
        $recruiterIds = [(int) $request->user()->id];

        $saveJobPosting->create($validated, (int) $request->user()->id, $recruiterIds);

        return redirect()->route('recruiter.jobs.index')->with('success', 'Job posting created.');
    }
}

