<?php

namespace App\Http\Controllers;

use App\Mail\NewJobApplicationMail;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\JobApplicationNotification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StudentJobController extends Controller
{
    public function myApplications(Request $request): Response
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $applications = JobApplication::query()
            ->where('user_id', $user->id)
            ->with([
                'job:id,title,reference,location,job_type,is_published',
                'recruiterInterviews' => fn ($q) => $q->orderByDesc('starts_at')->limit(1),
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (JobApplication $application) {
                $interview = $application->recruiterInterviews->first();

                return [
                    'id' => $application->id,
                    'status' => $application->status,
                    'subject' => $application->subject,
                    'created_at' => $application->created_at?->toIso8601String(),
                    'job' => $application->job ? [
                        'id' => $application->job->id,
                        'title' => $application->job->title,
                        'reference' => $application->job->reference,
                        'location' => $application->job->location,
                        'job_type' => $application->job->job_type,
                        'is_published' => (bool) $application->job->is_published,
                    ] : null,
                    'interview' => $interview ? [
                        'starts_at' => $interview->starts_at?->toIso8601String(),
                        'location' => $interview->location,
                        'outcome' => $interview->outcome,
                    ] : null,
                ];
            });

        return Inertia::render('students/Jobs/partials/my-applications', [
            'applications' => $applications,
        ]);
    }

    public function index(Request $request): Response
    {
        $filterJobTypes = $this->distinctJobTypes();
        $filterSkills = $this->distinctSkills();

        $jobType = $request->query('job_type');
        if (is_string($jobType) && $jobType !== '' && ! $filterJobTypes->contains($jobType)) {
            $jobType = null;
        }

        $requestedSkills = $request->query('skills', []);
        if (! is_array($requestedSkills)) {
            $requestedSkills = $requestedSkills !== null && $requestedSkills !== '' ? [(string) $requestedSkills] : [];
        }
        $requestedSkills = array_values(array_unique(array_filter(array_map('strval', $requestedSkills))));
        $requestedSkills = array_values(array_intersect($requestedSkills, $filterSkills->all()));

        $query = Job::query()
            ->published()
            ->latest();

        if ($jobType) {
            $query->where('job_type', $jobType);
        }

        if ($requestedSkills !== []) {
            $query->where(function ($q) use ($requestedSkills) {
                foreach ($requestedSkills as $skill) {
                    $q->orWhereJsonContains('skills', $skill);
                }
            });
        }

        $jobs = $query->get()->map(fn (Job $job) => $this->serializeJobSummary($job));

        return Inertia::render('students/Jobs/index', [
            'jobs' => $jobs,
            'filterOptions' => [
                'job_types' => $filterJobTypes->values()->all(),
                'skills' => $filterSkills->values()->all(),
            ],
            'appliedFilters' => [
                'job_type' => $jobType,
                'skills' => $requestedSkills,
            ],
        ]);
    }

    public function show(Request $request, Job $job): Response
    {
        if (! $job->is_published) {
            abort(404);
        }

        $user = $request->user();
        $hasApplied = $user && $job->applications()->where('user_id', $user->id)->exists();

        // Public job detail: Apply when the user may submit a new application (same rules as apply()).
        $canApply = $user && $this->userCanStartNewApplication($job, $user);

        return Inertia::render('students/Jobs/partials/[id]', [
            'job' => $this->serializeJobDetail($job, $hasApplied, false, null, $canApply),
        ]);
    }

    public function apply(Request $request, Job $job): RedirectResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        if (! $job->is_published) {
            abort(404);
        }

        if ($job->applications()->where('user_id', $user->id)->exists()) {
            return back()->with('error', __('You have already applied to this job.'));
        }

        if (! $this->userEligibleAsApplicant($job, $user)) {
            abort(403);
        }

        $useProfileCv = $request->boolean('use_profile_cv');

        $rules = [
            'subject' => ['required', 'string', 'max:255'],
            'cover_letter' => ['required', 'string', 'max:10000'],
        ];

        if (! $useProfileCv) {
            $rules['cv'] = ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'];
        }

        $validated = $request->validate($rules);

        if ($useProfileCv) {
            $cvPath = $this->copyProfileResumeToApplicationCv($user);
            if ($cvPath === null) {
                return back()->withErrors([
                    'cv' => __('You do not have a valid profile CV. Upload a CV on your profile or attach a file here.'),
                ]);
            }
        } else {
            $cvFile = $request->file('cv');
            if (! $cvFile instanceof UploadedFile) {
                return back()->withErrors([
                    'cv' => __('A CV file is required.'),
                ]);
            }
            $cvPath = $cvFile->store('job-application-cvs', 'public');
        }

        /** @var \App\Models\JobApplication $application */
        $application = $job->applications()->create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'cover_letter' => $validated['cover_letter'],
            'cv_path' => $cvPath,
            'status' => JobApplication::STATUS_PENDING,
        ]);

        $job->load(['organizations.accountUser', 'organizations.employers', 'creator']);
        $recipients = $job->organizations
            ->flatMap(function ($org) {
                $users = collect();
                if ($org->accountUser) {
                    $users->push($org->accountUser);
                }

                return $users->merge($org->employers);
            })
            ->filter(fn ($u) => $u->isRecruiter());
        if ($recipients->isEmpty() && $job->creator) {
            $recipients = collect([$job->creator]);
        }

        $applicationsUrl = url('/recruiter/applications');
        $sentTo = [];
        foreach ($recipients as $recipient) {
            $email = strtolower(trim((string) ($recipient->email ?? '')));
            if ($email === '' || isset($sentTo[$email])) {
                continue;
            }
            $sentTo[$email] = true;
            Mail::to($recipient->email)->send(new NewJobApplicationMail($job, $application, $user, $applicationsUrl));
        }

        JobApplicationNotification::notifyRecruiters($job, $application, $user);

        return back()->with('success', __('Your application was submitted.'));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeJobSummary(Job $job): array
    {
        $skills = $job->skills ?? [];
        $description = $job->description ?? '';
        $plain = trim(preg_replace('/\s+/u', ' ', strip_tags($description)));
        $excerpt = mb_strlen($plain) > 220 ? mb_substr($plain, 0, 217).'…' : $plain;

        return [
            'id' => $job->id,
            'reference' => $job->reference,
            'title' => $job->title,
            'excerpt' => $excerpt,
            'location' => $job->location,
            'job_type' => $job->job_type,
            'skills' => $skills,
            'created_at' => $job->created_at->toIso8601String(),
        ];
    }

    /**
     * @param  array{href: string, label: string}|null  $manage
     * @return array<string, mixed>
     */
    private function serializeJobDetail(Job $job, bool $hasApplied = false, bool $isManager = false, ?array $manage = null, bool $canApply = false): array
    {
        return [
            'id' => $job->id,
            'reference' => $job->reference,
            'title' => $job->title,
            'description' => $job->description,
            'location' => $job->location,
            'job_type' => $job->job_type,
            'skills' => $job->skills ?? [],
            'created_at' => $job->created_at->toIso8601String(),
            'has_applied' => $hasApplied,
            'can_apply' => $canApply,
            'is_owner' => $isManager,
            'manage' => $manage,
        ];
    }

    /**
     * Copy the user's profile resume (storage/app/public/resumes) into job-application-cvs.
     */
    private function copyProfileResumeToApplicationCv(User $user): ?string
    {
        $contents = $user->readStoredResumeContents();
        if ($contents === null) {
            return null;
        }

        $safeName = basename((string) $user->resume);
        if ($safeName === '') {
            return null;
        }

        $ext = strtolower(pathinfo($safeName, PATHINFO_EXTENSION) ?: 'pdf');
        if (! in_array($ext, ['pdf', 'doc', 'docx'], true)) {
            return null;
        }

        $destRelative = 'job-application-cvs/'.Str::uuid()->toString().'.'.$ext;
        $ok = Storage::disk('public')->put($destRelative, $contents);

        return $ok ? $destRelative : null;
    }

    private function userCanStartNewApplication(Job $job, User $user): bool
    {
        if ($job->applications()->where('user_id', $user->id)->exists()) {
            return false;
        }

        return $this->userEligibleAsApplicant($job, $user);
    }

    /**
     * Who may post an application: students/coworkers, staff who browse job pages, or recruiters not assigned to this job.
     * Blocks job creator and recruiters assigned to this posting.
     */
    private function userEligibleAsApplicant(Job $job, User $user): bool
    {
        $uid = (int) $user->id;
        if ($job->user_id !== null && (int) $job->user_id === $uid) {
            return false;
        }
        $organizationId = $user->organizationIdForRecruiting();
        if ($organizationId && $job->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

        $roles = $this->normalizedRoleStrings($user);
        $studentLike = ['student', 'coworker'];
        $staffWhoBrowseJobs = ['admin', 'coach', 'moderateur', 'studio_responsable', 'super_admin', 'responsable_studio'];

        if (array_intersect($roles, $studentLike) !== []) {
            return true;
        }
        if (array_intersect($roles, $staffWhoBrowseJobs) !== []) {
            return true;
        }
        if (in_array('recruiter', $roles, true)) {
            return true;
        }

        return false;
    }

    /**
     * @return list<string>
     */
    private function normalizedRoleStrings(User $user): array
    {
        $raw = $user->role;
        if ($raw === null || $raw === '') {
            return [];
        }
        if (! is_array($raw)) {
            $raw = [$raw];
        }
        $out = [];
        foreach ($raw as $r) {
            if ($r === null || $r === '') {
                continue;
            }
            $s = strtolower(trim((string) $r));
            if ($s !== '') {
                $out[] = $s;
            }
        }

        return array_values(array_unique($out));
    }

    private function distinctJobTypes(): Collection
    {
        return Job::query()
            ->published()
            ->pluck('job_type')
            ->map(fn ($type) => is_string($type) ? trim($type) : '')
            ->filter(fn (string $type) => $type !== '')
            ->unique()
            ->sort()
            ->values();
    }

    private function distinctSkills(): Collection
    {
        $rows = Job::query()
            ->published()
            ->pluck('skills');

        return $rows
            ->filter()
            ->flatten()
            ->map(fn ($s) => is_string($s) ? trim($s) : $s)
            ->filter(fn ($s) => $s !== null && $s !== '')
            ->unique()
            ->sort()
            ->values();
    }
}
