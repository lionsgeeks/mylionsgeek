<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Jobs\CreateInvitedUser;
use App\Models\User;
use App\Http\Controllers\UserProjectController;
use App\Http\Controllers\Admin\GlobalAnalyticsController;
use App\Http\Controllers\AdminProjectController;
use App\Http\Controllers\ReservationsController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Welcome/index');
})->name('home');

// Protect admin dashboard
Route::middleware(['auth', 'verified', 'role:admin,moderateur,coach,studio_responsable'])->prefix('admin')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Global Analytics (admin)
    Route::get('analytics/global', [GlobalAnalyticsController::class, 'index'])->name('admin.analytics.global');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/reservations/check-availability', [ReservationsController::class, 'checkStudioAvailability'])->name('reservations.check-availability');
    Route::post('/reservations/available-equipment', [ReservationsController::class, 'availableEquipment'])->name('reservations.available-equipment');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin/users.php';
require __DIR__ . '/admin/computers.php';
require __DIR__ . '/admin/leaderboard.php';
require __DIR__ . '/admin/training.php';
require __DIR__ . '/admin/geeko.php';
require __DIR__ . '/admin/equipment.php';
require __DIR__ . '/admin/places.php';
require __DIR__ . '/admin/reservations.php';
require __DIR__ . '/admin/projects.php';
require __DIR__ . '/admin/recuiter.php';
require __DIR__ . '/admin/games.php';
require __DIR__ . '/student/students.php';
require __DIR__ . '/studentProjects.php';
require __DIR__ . '/admin/project-approvals.php';
require __DIR__ . '/student/posts.php';
