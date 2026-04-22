<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruiterStudentController extends Controller
{
    /** Staff / elevated roles: never listed or opened from the recruiter student directory. */
    private const EXCLUDED_ROLES_FROM_DIRECTORY = ['admin', 'coach', 'pro', 'moderateur'];

    private const FIELD_FILTERS = ['coding', 'media'];

    public function index(Request $request): Response
    {
        $q = $request->query('q');
        $q = is_string($q) ? trim($q) : '';
        $field = $request->query('field');
        $field = is_string($field) ? trim($field) : '';
        if (! in_array($field, self::FIELD_FILTERS, true)) {
            $field = '';
        }

        $students = User::query()
            ->with('formation:id,name')
            ->whereJsonContains('role', 'student')
            ->where(function ($q) {
                // Exclude "Studying" in a case/space-insensitive way.
                $q->whereRaw('LOWER(TRIM(status)) != ?', ['studying'])
                    ->orWhereNull('status');
            });
        foreach (self::EXCLUDED_ROLES_FROM_DIRECTORY as $role) {
            $students->whereJsonDoesntContain('role', $role);
        }

        if ($q !== '') {
            $students->where('name', 'like', '%'.$q.'%');
        }

        if ($field !== '') {
            $students->where('field', $field);
        }

        $students = $students
            ->orderBy('name')
            ->paginate(12)
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'image' => $u->image,
                'status' => $u->status,
                'field' => $u->field,
                'formation' => $u->formation?->name ?? '',
            ])
            ->withQueryString();

        return Inertia::render('recruiter/students/index', [
            'students' => $students,
            'filters' => [
                'q' => $q,
                'field' => $field,
            ],
        ]);
    }

    public function show(Request $request, User $user, StudentController $studentController, UsersController $usersController): Response
    {
        $recruiter = $request->user();
        if (! $recruiter) {
            abort(403);
        }

        $this->ensureRecruiterCanViewUser($user, $recruiter);

        $userPayload = $studentController->getUserInfo($user->id);
        $profilePosts = $usersController->getPostsForProfileUser((int) $user->id, 1);

        return Inertia::render('recruiter/students/show', [
            'user' => $userPayload,
            'profilePostsPreview' => $profilePosts['posts']->values()->all(),
            'profilePostsTotal' => $profilePosts['total'],
        ]);
    }

    /**
     * Recruiters may open a profile if the user appears in the alumni-style student directory,
     * or if they have submitted an application to any job posting this recruiter is assigned to.
     */
    private function ensureRecruiterCanViewUser(User $target, User $recruiter): void
    {
        if ($this->isDirectoryListedStudent($target)) {
            return;
        }

        if ($this->hasApplicationOnRecruitersJob($target, $recruiter)) {
            return;
        }

        abort(404);
    }

    /** Same eligibility rules as {@see index()} listing (browsable directory). */
    private function isDirectoryListedStudent(User $user): bool
    {
        $roles = is_array($user->role) ? $user->role : [$user->role];
        if (! in_array('student', $roles, true)) {
            return false;
        }
        $status = $user->status;
        $normalizedStatus = is_string($status) ? strtolower(trim($status)) : '';
        if ($normalizedStatus === 'studying') {
            return false;
        }
        foreach (self::EXCLUDED_ROLES_FROM_DIRECTORY as $role) {
            if (in_array($role, $roles, true)) {
                return false;
            }
        }

        return true;
    }

    private function hasApplicationOnRecruitersJob(User $applicant, User $recruiter): bool
    {
        return JobApplication::query()
            ->where('user_id', $applicant->id)
            ->whereHas('job', fn ($q) => $q->whereHas('recruiters', fn ($q2) => $q2->where('users.id', $recruiter->id)))
            ->exists();
    }
}
