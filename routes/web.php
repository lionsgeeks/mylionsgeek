<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

// Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('Student/Dashboard');
//     })->name('student.dashboard');
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/users.php';
require __DIR__.'/computers.php';
require __DIR__.'/leaderboard.php';
require __DIR__.'/training.php';
require __DIR__.'/geeko.php';
require __DIR__.'/equipment.php';
require __DIR__.'/places.php';
require __DIR__.'/reservations.php';
require __DIR__.'/projects.php';
require __DIR__.'/recuiter.php';
require __DIR__.'/games.php';

// Two-Factor Authentication Routes
Route::middleware('auth')->prefix('api')->group(function () {
    Route::post('/two-factor-authentication', [App\Http\Controllers\TwoFactorController::class, 'store']);
    Route::delete('/two-factor-authentication', [App\Http\Controllers\TwoFactorController::class, 'destroy']);
    Route::get('/two-factor-qr-code', [App\Http\Controllers\TwoFactorController::class, 'showQrCode']);
    Route::get('/two-factor-recovery-codes', [App\Http\Controllers\TwoFactorController::class, 'showRecoveryCodes']);
    Route::post('/two-factor-recovery-codes', [App\Http\Controllers\TwoFactorController::class, 'storeRecoveryCodes']);
    Route::post('/two-factor-confirm', [App\Http\Controllers\TwoFactorController::class, 'confirm']);
    Route::post('/two-factor-verify', [App\Http\Controllers\TwoFactorController::class, 'verify']);
});
