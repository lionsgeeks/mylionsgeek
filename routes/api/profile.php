<?php

use App\Http\Controllers\API\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::get('/profile/{userId}', [ProfileController::class, 'show']);
    Route::get('/profile/{userId}/followers', [ProfileController::class, 'listFollowers']);
    Route::get('/profile/{userId}/following', [ProfileController::class, 'listFollowing']);
    Route::post('/users/{userId}/follow', [ProfileController::class, 'follow']);
});

