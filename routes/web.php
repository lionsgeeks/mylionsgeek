<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Jobs\CreateInvitedUser;
use App\Models\User;
use App\Http\Controllers\UserProjectController;


Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Welcome/index');
})->name('home');

// Protect admin dashboard
Route::middleware(['auth', 'verified', 'role:admin,coach'])->prefix('admin')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('/admin/users/{id}/projects/{projectId}', [UserProjectController::class, 'destroy'])->name('user-projects.destroy');
    Route::post('/admin/users/{id}/projects', [UserProjectController::class, 'store']);

});


// Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('Student/Dashboard');
//     })->name('student.dashboard');
// });






require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/users.php';
require __DIR__ . '/computers.php';
require __DIR__ . '/leaderboard.php';
require __DIR__ . '/training.php';
require __DIR__ . '/geeko.php';
require __DIR__ . '/equipment.php';
require __DIR__ . '/places.php';
require __DIR__ . '/reservations.php';
require __DIR__ . '/projects.php';
require __DIR__ . '/recuiter.php';
require __DIR__ . '/games.php';
