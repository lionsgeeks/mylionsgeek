<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Jobs\CreateInvitedUser;
use App\Models\User;


Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Welcome/index');
})->name('home');

// Protect admin dashboard
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('Student/Dashboard');
//     })->name('student.dashboard');
// });

// Spaces route: show spaces (studios and cowork tables) for booking
Route::middleware(['auth','verified'])->get('/spaces', function () {
    $studios = \DB::table('studios')->select('id','name','state','image')->orderBy('name')->get()
        ->map(function($studio) {
            $img = $studio->image ? (
                str_starts_with($studio->image, 'http') || str_starts_with($studio->image, 'storage/')
                    ? $studio->image
                    : ('storage/img/studio/' . ltrim($studio->image, '/'))
            ) : null;
            return [
                'id' => $studio->id,
                'name' => $studio->name,
                'state' => (bool) $studio->state,
                'image' => $img ? asset($img) : null,
                'type' => 'studio'
            ];
        });
    $coworks = \DB::table('coworks')->select('id','table','state','image')->orderBy('table')->get()
        ->map(function($cowork) {
            $img = $cowork->image ? (
                str_starts_with($cowork->image, 'http') || str_starts_with($cowork->image, 'storage/')
                    ? $cowork->image
                    : ('storage/img/cowork/' . ltrim($cowork->image, '/'))
            ) : null;
            return [
                'id' => $cowork->id,
                'name' => 'Table '.$cowork->table,
                'state' => (bool) $cowork->state,
                'image' => $img ? asset($img) : null,
                'type' => 'cowork',
            ];
        });
    return Inertia::render('spaces', [
        'studios' => $studios,
        'coworks' => $coworks,
    ]);
})->name('spaces');

Route::middleware(['auth','verified'])->get('/reservations/{reservation}', [\App\Http\Controllers\ReservationsController::class, 'userDetails'])->name('reservations.details');

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
