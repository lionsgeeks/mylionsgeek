<?php

use App\Http\Controllers\LeaderboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// leaderboard

Route::middleware(["auth"])->group(function () {
    
    Route::get('/students/leaderboard', [LeaderboardController::class, 'index'])->name('students.leaderboard');
    Route::get('/waka', [LeaderboardController::class, 'getData']);
    Route::get('/leaderboard/data', [LeaderboardController::class, 'getData'])->name('leaderboard.data');
    Route::get('/leaderboard/weekly-winners', [LeaderboardController::class, 'getWeeklyWinners'])->name('leaderboard.weekly-winners');
});