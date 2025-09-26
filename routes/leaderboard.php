<?php

use App\Http\Controllers\LeaderboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// leaderboard
Route::get('/students/leaderboard', [LeaderboardController::class, 'index'])->name('students.leaderboard');
Route::get('/waka', [LeaderboardController::class, 'getData']);