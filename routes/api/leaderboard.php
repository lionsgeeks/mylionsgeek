<?php

use App\Http\Controllers\API\LeaderboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
});

