<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        /** @var User $user */
        $user = Auth::user();
        $roles = is_array($user->role) ? $user->role : [$user->role];
        $staffForAdminDashboard = array_intersect($roles, ['admin', 'moderateur', 'coach', 'studio_responsable']);
        if ($staffForAdminDashboard !== []) {
            return redirect()->route('dashboard');
        }
        if (in_array('student', $roles, true)) {
            return redirect()->route('student.feed');
        }
        if (in_array('recruiter', $roles, true)) {
            $user->loadMissing('organisationAccount');
            if ($user->isOrganisationAccount()
                && $user->organisationAccount
                && (! $user->organisationAccount->hasCompletedOnboarding() || $user->must_change_password)) {
                return redirect()->route('organisation.onboarding');
            }

            return redirect()->route('recruiter.dashboard');
        }

        return redirect()->route('profile.edit');
    }

    $users = User::query()->toBase()->count();
    $staf = User::query()
        ->where(function ($query) {
            $query->whereJsonDoesntContain('role', 'student')
                ->orWhereJsonLength('role', '>', 1);
        })
        ->toBase()
        ->count();

    return Inertia::render('Welcome/index', [
        'users' => $users,
        'staf' => $staf,
    ]);
})->name('home');
