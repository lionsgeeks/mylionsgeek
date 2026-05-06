<?php

use App\Http\Controllers\API\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::post('/profile/update', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/cover', [ProfileController::class, 'updateCover']);
    Route::get('/profile/social-links', [ProfileController::class, 'listSocialLinks']);
    Route::post('/profile/social-links', [ProfileController::class, 'addSocialLink']);
    Route::delete('/profile/social-links/{id}', [ProfileController::class, 'deleteSocialLink']);

    // Experiences (must be defined BEFORE /profile/{userId} to avoid route conflicts)
    Route::post('/profile/experiences', ['App\\Http\\Controllers\\API\\ProfileExperienceController', 'store']);
    Route::put('/profile/experiences/{id}', ['App\\Http\\Controllers\\API\\ProfileExperienceController', 'update'])->whereNumber('id');
    Route::delete('/profile/experiences/{id}', ['App\\Http\\Controllers\\API\\ProfileExperienceController', 'destroy'])->whereNumber('id');

    Route::get('/profile/{userId}', [ProfileController::class, 'show']);
    Route::get('/profile/{userId}/followers', [ProfileController::class, 'listFollowers']);
    Route::get('/profile/{userId}/following', [ProfileController::class, 'listFollowing']);
    Route::post('/users/{userId}/follow', [ProfileController::class, 'follow']);
});

