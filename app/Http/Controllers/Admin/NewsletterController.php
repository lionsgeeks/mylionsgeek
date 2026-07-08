<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\NewsletterEmail;
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

        $history = NewsletterEmail::with('sender:id,name')
            ->latest()
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
        ]);
    }
}
