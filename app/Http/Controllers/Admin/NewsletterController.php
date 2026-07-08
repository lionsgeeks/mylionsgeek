<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\User;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->where('role', '!=', 'admin')
            ->whereNotNull('email')
            ->orderByDesc('created_at')
            ->get()
            ->filter(fn (User $user) => ! $user->isRecruiter())
            ->values()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'formation_id' => $user->formation_id,
            ]);

        $trainings = Formation::with(['coach:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Formation $formation) => [
                'id' => $formation->id,
                'name' => $formation->name,
                'coach' => $formation->coach
                    ? ['id' => $formation->coach->id, 'name' => $formation->coach->name]
                    : null,
            ]);

        $roles = $users
            ->flatMap(fn ($user) => is_array($user['role']) ? $user['role'] : [$user['role']])
            ->filter()
            ->unique()
            ->values()
            ->all();

        return Inertia::render('admin/newsletter/index', [
            'users' => $users,
            'trainings' => $trainings,
            'roles' => $roles,
        ]);
    }
}
