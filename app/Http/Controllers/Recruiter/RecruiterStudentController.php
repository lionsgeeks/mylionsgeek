<?php

namespace App\Http\Controllers\Recruiter;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruiterStudentController extends Controller
{
    /** Staff / elevated roles: never listed or opened from the recruiter student directory. */
    private const EXCLUDED_ROLES_FROM_DIRECTORY = ['admin', 'coach', 'pro', 'moderateur'];

    public function index(Request $request): Response
    {
        $students = User::query()
            ->with('formation:id,name')
            ->whereJsonContains('role', 'student')
            ->where(function ($q) {
                $q->where('status', '!=', 'Studying')
                    ->orWhereNull('status');
            });
        foreach (self::EXCLUDED_ROLES_FROM_DIRECTORY as $role) {
            $students->whereJsonDoesntContain('role', $role);
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
        ]);
    }

    public function show(User $user, StudentController $studentController, UsersController $usersController): Response
    {
        $this->ensureRecruiterCanViewStudent($user);

        $userPayload = $studentController->getUserInfo($user->id);
        $profilePosts = $usersController->getPostsForProfileUser((int) $user->id, 1);

        return Inertia::render('recruiter/students/show', [
            'user' => $userPayload,
            'profilePostsPreview' => $profilePosts['posts']->values()->all(),
            'profilePostsTotal' => $profilePosts['total'],
        ]);
    }

    private function ensureRecruiterCanViewStudent(User $user): void
    {
        $roles = is_array($user->role) ? $user->role : [$user->role];
        if (! in_array('student', $roles, true)) {
            abort(404);
        }
        if ($user->status === 'Studying') {
            abort(404);
        }
        foreach (self::EXCLUDED_ROLES_FROM_DIRECTORY as $role) {
            if (in_array($role, $roles, true)) {
                abort(404);
            }
        }
    }
}
