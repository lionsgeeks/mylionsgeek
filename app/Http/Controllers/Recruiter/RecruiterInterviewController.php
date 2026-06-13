<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Mail\InterviewOutcomeToApplicantMail;
use App\Mail\InterviewScheduledToApplicantMail;
use App\Models\JobApplication;
use App\Models\RecruiterInterview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RecruiterInterviewController extends Controller
{
    private const SLOT_MINUTES = 30;

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
                'outcome' => $row->outcome,
                'job_application_id' => $row->job_application_id,
                'application' => $row->jobApplication ? [
                    'id' => $row->jobApplication->id,
                    'job_title' => $row->jobApplication->job?->title,
                    'applicant_name' => $row->jobApplication->applicant?->name,
                ] : null,
            ]);

        $organizationId = $request->user()->organizationIdForRecruiting();
        if (! $organizationId) {
            abort(403);
        }

        $applicationOptions = JobApplication::query()
            ->whereHas('job', fn ($q) => $q->forOrganization($organizationId))
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

        $uniqueApplication = Rule::unique('recruiter_interviews', 'job_application_id')
            ->where(fn ($q) => $q->where('user_id', $userId));

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'group_label' => ['nullable', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'location' => [
                'nullable',
                'string',
                'max:500',
                Rule::requiredIf(fn () => filled($request->input('job_application_id'))),
            ],
            'notes' => ['nullable', 'string', 'max:5000'],
            'job_application_id' => [
                'nullable',
                'integer',
                $this->jobApplicationExistsForRecruiterRule($userId),
                $uniqueApplication,
            ],
            'redirect' => ['nullable', 'string', Rule::in(['interviews'])],
        ]);

        $starts = Carbon::parse($validated['starts_at']);
        $jobApplicationId = isset($validated['job_application_id']) ? (int) $validated['job_application_id'] : null;
        $this->validateInterviewScheduleRules($starts, $userId, $jobApplicationId, null);

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

        $userId = (int) $request->user()->id;

        $previousApplicationId = $recruiterInterview->job_application_id;
        $previousStartsIso = $recruiterInterview->starts_at?->toIso8601String();
        $previousLocation = $recruiterInterview->location;

        $uniqueApplication = Rule::unique('recruiter_interviews', 'job_application_id')
            ->where(fn ($q) => $q->where('user_id', $userId))
            ->ignore($recruiterInterview->id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'group_label' => ['nullable', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'location' => [
                'nullable',
                'string',
                'max:500',
                Rule::requiredIf(fn () => filled($request->input('job_application_id'))),
            ],
            'notes' => ['nullable', 'string', 'max:5000'],
            'job_application_id' => [
                'nullable',
                'integer',
                $this->jobApplicationExistsForRecruiterRule($userId),
                $uniqueApplication,
            ],
        ]);

        $starts = Carbon::parse($validated['starts_at']);
        $jobApplicationId = isset($validated['job_application_id']) ? (int) $validated['job_application_id'] : null;
        $this->validateInterviewScheduleRules($starts, $userId, $jobApplicationId, $recruiterInterview->id);

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

    public function recordOutcome(Request $request, RecruiterInterview $recruiterInterview): RedirectResponse
    {
        $this->authorizeInterview($request, $recruiterInterview);

        $validated = $request->validate([
            'outcome' => ['required', 'string', Rule::in(['accepted', 'rejected'])],
        ]);

        if (! $recruiterInterview->job_application_id) {
            abort(422);
        }

        $startsAt = $recruiterInterview->starts_at;
        if (! $startsAt instanceof Carbon) {
            abort(422);
        }

        $slotEnd = $startsAt->copy()->addMinutes(self::SLOT_MINUTES);
        if (Carbon::now()->lt($slotEnd)) {
            throw ValidationException::withMessages([
                'outcome' => __('You can record a decision only after the interview slot has ended.'),
            ]);
        }

        if (filled($recruiterInterview->outcome)) {
            throw ValidationException::withMessages([
                'outcome' => __('This interview already has a decision recorded.'),
            ]);
        }

        DB::transaction(function () use ($recruiterInterview, $validated): void {
            $recruiterInterview->update(['outcome' => $validated['outcome']]);

            $application = JobApplication::query()->whereKey($recruiterInterview->job_application_id)->first();
            if ($application) {
                $application->update([
                    'status' => $validated['outcome'] === 'accepted'
                        ? JobApplication::STATUS_ACCEPTED
                        : JobApplication::STATUS_REJECTED,
                ]);
            }
        });

        $recruiterInterview->refresh();
        $this->notifyApplicantOfInterviewOutcome($recruiterInterview, $request->user(), $validated['outcome']);

        return back()->with('success', __('Interview outcome saved.'));
    }

    private function authorizeInterview(Request $request, RecruiterInterview $interview): void
    {
        if ((int) $interview->user_id !== (int) $request->user()->id) {
            abort(403);
        }
    }

    private function validateInterviewScheduleRules(Carbon $start, int $recruiterUserId, ?int $jobApplicationId, ?int $ignoreInterviewId): void
    {
        if ($start->lte(Carbon::now())) {
            throw ValidationException::withMessages([
                'starts_at' => __('Choose a date and time in the future.'),
            ]);
        }

        $local = $start->copy()->timezone(config('app.timezone'));
        $minutesFromMidnight = ($local->hour * 60) + $local->minute;
        $windowStart = 7 * 60;
        $windowEndExclusive = 19 * 60;

        if ($minutesFromMidnight < $windowStart || $minutesFromMidnight >= $windowEndExclusive) {
            throw ValidationException::withMessages([
                'starts_at' => __('Interview must start between 7:00 and 19:00 (:tz).', ['tz' => config('app.timezone')]),
            ]);
        }

        $this->assertNoInterviewOverlap($start, $recruiterUserId, $jobApplicationId, $ignoreInterviewId);
    }

    /**
     * Block overlapping 30-minute slots for (a) this recruiter’s calendar and (b) any other interview tied to the same job posting when an application is linked.
     */
    private function assertNoInterviewOverlap(Carbon $start, int $recruiterUserId, ?int $jobApplicationId, ?int $ignoreInterviewId): void
    {
        $newEnd = $start->copy()->addMinutes(self::SLOT_MINUTES);

        $jobPostingId = null;
        if ($jobApplicationId) {
            $jobPostingId = JobApplication::query()->whereKey($jobApplicationId)->value('job_posting_id');
        }

        $candidates = RecruiterInterview::query()
            ->when($ignoreInterviewId !== null, fn ($q) => $q->where('id', '!=', $ignoreInterviewId))
            ->where(function ($q) use ($recruiterUserId, $jobPostingId) {
                $q->where('user_id', $recruiterUserId);
                if ($jobPostingId) {
                    $q->orWhere(function ($q2) use ($jobPostingId) {
                        $q2->whereNotNull('job_application_id')
                            ->whereHas('jobApplication', fn ($j) => $j->where('job_posting_id', $jobPostingId));
                    });
                }
            })
            ->get(['id', 'starts_at']);

        foreach ($candidates as $existing) {
            $existingStart = $existing->starts_at;
            if (! $existingStart instanceof Carbon) {
                continue;
            }
            $existingEnd = $existingStart->copy()->addMinutes(self::SLOT_MINUTES);
            if ($start->lt($existingEnd) && $newEnd->gt($existingStart)) {
                $message = $jobPostingId
                    ? __('This time slot is already reserved for another interview for this job.')
                    : __('This time overlaps another interview on your calendar.');

                throw ValidationException::withMessages([
                    'starts_at' => $message,
                ]);
            }
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

    private function notifyApplicantOfInterviewOutcome(RecruiterInterview $interview, User $recruiter, string $outcome): void
    {
        if (! in_array($outcome, ['accepted', 'rejected'], true)) {
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
            Mail::to($applicant->email)->send(new InterviewOutcomeToApplicantMail(
                applicant: $applicant,
                recruiter: $recruiter,
                outcome: $outcome,
                jobTitle: $application->job?->title,
                interviewTitle: (string) $interview->title,
                startsAt: $startsAt,
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
            $organizationId = User::query()->whereKey($userId)->first()?->organizationIdForRecruiting();
            if (! $organizationId) {
                $query->whereRaw('1 = 0');

                return;
            }

            $query->whereExists(function (Builder $sub) use ($organizationId): void {
                $sub->selectRaw('1')
                    ->from('job_posting_organization')
                    ->whereColumn('job_posting_organization.job_posting_id', 'job_applications.job_posting_id')
                    ->where('job_posting_organization.organization_id', $organizationId);
            });
        });
    }
}
