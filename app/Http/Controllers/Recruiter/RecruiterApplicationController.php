<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\RecruiterInterview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RecruiterApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId) {
            abort(403);
        }

        $jobs = Job::query()
            ->forOrganization($organizationId)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Job $job) => [
                'id' => $job->id,
                'title' => $job->title,
                'reference' => $job->reference,
                'location' => $job->location,
                'job_type' => $job->job_type,
                'is_published' => (bool) $job->is_published,
                'applications_count' => $job->applications_count,
                'created_at' => $job->created_at?->toIso8601String(),
            ]);

        return Inertia::render('recruiter/applications/index', [
            'jobs' => $jobs,
        ]);
    }

    public function showJob(Request $request, Job $job): Response
    {
        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId) {
            abort(403);
        }

        if (! $job->organizations()->where('organizations.id', $organizationId)->exists()) {
            abort(403);
        }

        $userId = $request->user()->id;

        $applications = JobApplication::query()
            ->where('job_posting_id', $job->id)
            ->with(['applicant:id,name,email,image'])
            ->orderByDesc('created_at')
            ->get();

        $applicationIds = $applications->pluck('id');
        $interviewsByApplicationId = $applicationIds->isEmpty()
            ? collect()
            : RecruiterInterview::query()
                ->where('user_id', $userId)
                ->whereIn('job_application_id', $applicationIds)
                ->get(['id', 'job_application_id', 'starts_at', 'outcome'])
                ->keyBy('job_application_id');

        $applications = $applications->map(function (JobApplication $row) use ($interviewsByApplicationId) {
            $interview = $interviewsByApplicationId->get($row->id);

            return [
                'id' => $row->id,
                'status' => $row->status,
                'subject' => $row->subject,
                'cover_letter' => $row->cover_letter,
                'cv_path' => $row->cv_path,
                'has_cv' => (bool) $row->cv_path,
                'created_at' => $row->created_at?->toIso8601String(),
                'recruiter_interview' => $interview ? [
                    'id' => $interview->id,
                    'starts_at' => $interview->starts_at->toIso8601String(),
                    'outcome' => $interview->outcome,
                ] : null,
                'applicant' => $row->applicant ? [
                    'id' => $row->applicant->id,
                    'name' => $row->applicant->name,
                    'email' => $row->applicant->email,
                    'image' => $row->applicant->image,
                ] : null,
            ];
        });

        return Inertia::render('recruiter/applications/partials/job', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'reference' => $job->reference,
                'location' => $job->location,
                'job_type' => $job->job_type,
            ],
            'applications' => $applications,
        ]);
    }

    /**
     * Stream the CV for inline viewing (browser tab). Local disk does not support temporaryUrl();
     * this keeps the file behind recruiter auth instead of exposing a public URL.
     */
    public function downloadCv(Request $request, JobApplication $application): BinaryFileResponse
    {
        $userId = $request->user()->id;
        $organizationId = $request->user()->organizationIdForRecruiting();

        $allowed = JobApplication::query()
            ->whereKey($application->getKey())
            ->whereHas('job', fn ($q) => $q->forOrganization($organizationId))
            ->exists();

        if (! $allowed) {
            abort(403);
        }

        if (! $application->cv_path || ! Storage::disk('public')->exists($application->cv_path)) {
            abort(404);
        }

        $application->loadMissing('applicant');
        $applicant = $application->applicant;
        $safe = $applicant ? preg_replace('/[^a-z0-9_-]+/i', '_', $applicant->name) : 'cv';
        $ext = pathinfo($application->cv_path, PATHINFO_EXTENSION) ?: 'bin';
        $downloadName = 'cv_'.$safe.'.'.$ext;

        $absolutePath = Storage::disk('public')->path($application->cv_path);
        if (! is_file($absolutePath)) {
            abort(404);
        }

        return response()->file($absolutePath, [
            'Content-Disposition' => 'inline; filename="'.$downloadName.'"',
        ]);
    }

    public function updateStatus(Request $request, JobApplication $application): RedirectResponse
    {
        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId) {
            abort(403);
        }

        $allowed = JobApplication::query()
            ->whereKey($application->getKey())
            ->whereHas('job', fn ($q) => $q->forOrganization($organizationId))
            ->exists();

        if (! $allowed) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(JobApplication::RECRUITER_MANUAL_STATUSES)],
        ]);

        $application->update(['status' => $validated['status']]);

        return back()->with('success', __('Application status updated.'));
    }
}
