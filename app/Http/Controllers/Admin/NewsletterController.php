<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\NewsletterEmail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();
        $authRoles = is_array($authUser?->role) ? $authUser->role : [$authUser?->role];
        $isAdmin = in_array('admin', $authRoles, true);
        $isCoachOnly = ! $isAdmin && in_array('coach', $authRoles, true);

        $coachTrainingIds = collect();
        if ($isCoachOnly) {
            $coachTrainingIds = Formation::query()
                ->where('user_id', $authUser->id)
                ->pluck('id');
        }

        $usersQuery = User::query()
            ->where('role', '!=', 'admin')
            ->whereNotNull('email')
            ->orderByDesc('created_at');

        if ($isCoachOnly) {
            if ($coachTrainingIds->isEmpty()) {
                $usersQuery->whereRaw('1 = 0');
            } else {
                $usersQuery->whereIn('formation_id', $coachTrainingIds);
            }
        }

        $users = $usersQuery
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

        $trainingsQuery = Formation::with(['coach:id,name'])->orderByDesc('created_at');
        if ($isCoachOnly) {
            $trainingsQuery->where('user_id', $authUser->id);
        }

        $trainings = $trainingsQuery
            ->get()
            ->map(fn (Formation $formation) => [
                'id' => $formation->id,
                'name' => $formation->name,
                'coach' => $formation->coach
                    ? ['id' => $formation->coach->id, 'name' => $formation->coach->name]
                    : null,
            ]);

        $roles = $isCoachOnly
            ? []
            : $users
                ->flatMap(fn ($user) => is_array($user['role']) ? $user['role'] : [$user['role']])
                ->filter()
                ->unique()
                ->values()
                ->all();

        $historyQuery = NewsletterEmail::with('sender:id,name')->latest();
        if ($isCoachOnly) {
            $historyQuery->where('sent_by', $authUser->id);
        }

        $history = $historyQuery
            ->get()
            ->map(fn (NewsletterEmail $email) => [
                'id' => $email->id,
                'subject' => $email->subject,
                'preview' => $email->body_en
                    ?: $email->body_fr
                    ?: $email->body_ar
                    ?: $email->body
                    ?: '',
                'recipients_count' => $email->recipients_count,
                'sent_by' => $email->sender?->name ?? 'Unknown',
                'sent_at' => $email->created_at->format('d-m-Y H:i'),
            ]);

        return Inertia::render('admin/newsletter/index', [
            'users' => $users,
            'trainings' => $trainings,
            'roles' => $roles,
            'history' => $history,
            'canSelectRoles' => $isAdmin,
            'isCoachScoped' => $isCoachOnly,
        ]);
    }
}
