<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\RecruiterInterview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RecruiterApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $jobs = Job::query()
            ->whereHas('recruiters', fn ($q) => $q->where('users.id', $userId))
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
        $userId = (int) $request->user()->id;

        if (! $job->recruiters()->where('users.id', $userId)->exists()) {
            abort(403);
        }

        $applications = JobApplication::query()
            ->where('job_posting_id', $job->id)
            ->with(['applicant:id,name,email,image'])
            ->orderByDesc('created_at')
            ->get();

        $applicationIds = $applications->pluck('id');
        $interviewIdsByApplication = $applicationIds->isEmpty()
            ? collect()
            : RecruiterInterview::query()
                ->where('user_id', $userId)
                ->whereIn('job_application_id', $applicationIds)
                ->pluck('id', 'job_application_id');

        $applications = $applications->map(fn (JobApplication $row) => [
            'id' => $row->id,
            'status' => $row->status,
            'subject' => $row->subject,
            'cover_letter' => $row->cover_letter,
            'cv_path' => $row->cv_path,
            'has_cv' => (bool) $row->cv_path,
            'created_at' => $row->created_at?->toIso8601String(),
            'recruiter_interview_id' => $interviewIdsByApplication[$row->id] ?? null,
            'applicant' => $row->applicant ? [
                'id' => $row->applicant->id,
                'name' => $row->applicant->name,
                'email' => $row->applicant->email,
                'image' => $row->applicant->image,
            ] : null,
        ]);

        return Inertia::render('recruiter/applications/job', [
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

        $allowed = JobApplication::query()
            ->whereKey($application->getKey())
            ->whereHas('job', fn ($q) => $q->whereHas('recruiters', fn ($q2) => $q2->where('users.id', $userId)))
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
}
