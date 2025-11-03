<?php

use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\MobileAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/invite-student"  , [UserController::class , "inviteStudent"]);

// Mobile authentication endpoints (public)
Route::post('/mobile/login', [MobileAuthController::class, 'login']);
Route::post('/mobile/forgot-password', [MobileAuthController::class, 'forgot']);

Route::middleware('auth:sanctum')->prefix('mobile')->group(function () {
    require __DIR__ . '/api/profile.php';
    require __DIR__ . '/api/posts.php';
    require __DIR__ . '/api/projects.php';
    require __DIR__ . '/api/reservations.php';
    require __DIR__ . '/api/leaderboard.php';
    require __DIR__ . '/api/search.php';
});
