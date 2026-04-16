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
                $q->where('status', '!=', 'Studying')
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
