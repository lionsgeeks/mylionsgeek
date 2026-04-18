<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Mail\InterviewScheduledToApplicantMail;
use App\Models\JobApplication;
use App\Models\RecruiterInterview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RecruiterInterviewController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $interviews = RecruiterInterview::query()
            ->where('user_id', $userId)
            ->with(['jobApplication.job:id,title,reference', 'jobApplication.applicant:id,name'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (RecruiterInterview $row) => [
                'id' => $row->id,
                'title' => $row->title,
                'group_label' => $row->group_label,
                'starts_at' => $row->starts_at->toIso8601String(),
                'location' => $row->location,
                'notes' => $row->notes,
                'job_application_id' => $row->job_application_id,
                'application' => $row->jobApplication ? [
                    'id' => $row->jobApplication->id,
                    'job_title' => $row->jobApplication->job?->title,
                    'applicant_name' => $row->jobApplication->applicant?->name,
                ] : null,
            ]);

        $applicationOptions = JobApplication::query()
            ->whereHas('job', fn ($q) => $q->whereHas('recruiters', fn ($q2) => $q2->where('users.id', $userId)))
            ->with(['job:id,title', 'applicant:id,name'])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (JobApplication $app) => [
                'id' => $app->id,
                'label' => ($app->job?->title ?? 'Job').' — '.($app->applicant?->name ?? 'Applicant'),
            ]);

        return Inertia::render('recruiter/interviews/index', [
            'interviews' => $interviews,
            'applicationOptions' => $applicationOptions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'group_label' => ['nullable', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'job_application_id' => [
                'nullable',
                'integer',
                $this->jobApplicationExistsForRecruiterRule($userId),
            ],
            'redirect' => ['nullable', 'string', Rule::in(['interviews'])],
        ]);

        $starts = Carbon::parse($validated['starts_at']);
        $location = isset($validated['location']) && trim($validated['location']) !== ''
            ? trim($validated['location'])
            : null;

        $interview = RecruiterInterview::create([
            'user_id' => $userId,
            'job_application_id' => $validated['job_application_id'] ?? null,
            'group_label' => $validated['group_label'] ?? null,
            'title' => $validated['title'],
            'starts_at' => $starts,
            'location' => $location,
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->notifyApplicantOfScheduledInterview($interview, $request->user());

        $success = __('Interview scheduled.');

        if (($validated['redirect'] ?? null) === 'interviews') {
            return redirect()->route('recruiter.interviews.index')->with('success', $success);
        }

        return back()->with('success', $success);
    }

    public function update(Request $request, RecruiterInterview $recruiterInterview): RedirectResponse
    {
        $this->authorizeInterview($request, $recruiterInterview);

        $previousApplicationId = $recruiterInterview->job_application_id;
        $previousStartsIso = $recruiterInterview->starts_at?->toIso8601String();
        $previousLocation = $recruiterInterview->location;

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'group_label' => ['nullable', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'job_application_id' => [
                'nullable',
                'integer',
                $this->jobApplicationExistsForRecruiterRule((int) $request->user()->id),
            ],
        ]);

        $starts = Carbon::parse($validated['starts_at']);
        $location = isset($validated['location']) && trim($validated['location']) !== ''
            ? trim($validated['location'])
            : null;

        $recruiterInterview->update([
            'job_application_id' => $validated['job_application_id'] ?? null,
            'group_label' => $validated['group_label'] ?? null,
            'title' => $validated['title'],
            'starts_at' => $starts,
            'location' => $location,
            'notes' => $validated['notes'] ?? null,
        ]);

        $newApplicationId = $validated['job_application_id'] ?? null;
        if ($newApplicationId) {
            $newStartsIso = $starts->toIso8601String();
            $applicationChanged = (int) $previousApplicationId !== (int) $newApplicationId;
            $scheduleChanged = $previousStartsIso !== $newStartsIso;
            $locationChanged = ($previousLocation ?? '') !== ($location ?? '');
            if ($applicationChanged || $scheduleChanged || $locationChanged) {
                $recruiterInterview->refresh();
                $this->notifyApplicantOfScheduledInterview($recruiterInterview, $request->user());
            }
        }

        return back()->with('success', __('Interview updated.'));
    }

    public function destroy(Request $request, RecruiterInterview $recruiterInterview): RedirectResponse
    {
        $this->authorizeInterview($request, $recruiterInterview);
        $recruiterInterview->delete();

        return back()->with('success', __('Interview removed.'));
    }

    private function authorizeInterview(Request $request, RecruiterInterview $interview): void
    {
        if ((int) $interview->user_id !== (int) $request->user()->id) {
            abort(403);
        }
    }

    private function notifyApplicantOfScheduledInterview(RecruiterInterview $interview, User $recruiter): void
    {
        if (! $interview->job_application_id) {
            return;
        }

        $interview->loadMissing(['jobApplication.applicant', 'jobApplication.job']);

        $application = $interview->jobApplication;
        if (! $application) {
            return;
        }

        $applicant = $application->applicant;
        if (! $applicant || ! is_string($applicant->email) || trim($applicant->email) === '') {
            return;
        }

        $startsAt = $interview->starts_at;
        if (! $startsAt instanceof Carbon) {
            return;
        }

        try {
            Mail::to($applicant->email)->send(new InterviewScheduledToApplicantMail(
                applicant: $applicant,
                recruiter: $recruiter,
                interviewTitle: (string) $interview->title,
                jobTitle: $application->job?->title,
                startsAt: $startsAt,
                location: $interview->location,
                notes: $interview->notes,
            ));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Exists rule callbacks receive a query builder on `job_applications`, not Eloquent — use whereExists, not whereHas.
     */
    private function jobApplicationExistsForRecruiterRule(int $userId): \Illuminate\Validation\Rules\Exists
    {
        return Rule::exists('job_applications', 'id')->where(function (Builder $query) use ($userId): void {
            $query->whereExists(function (Builder $sub) use ($userId): void {
                $sub->selectRaw('1')
                    ->from('job_posting_recruiter')
                    ->whereColumn('job_posting_recruiter.job_posting_id', 'job_applications.job_posting_id')
                    ->where('job_posting_recruiter.user_id', $userId);
            });
        });
    }
}
