<?php

use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\MobileAuthController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\API\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/invite-student", [UserController::class, "inviteStudent"]);

// Mobile authentication endpoints (public)
Route::post('/mobile/login', [MobileAuthController::class, 'login']);
Route::post('/mobile/forgot-password', [MobileAuthController::class, 'forgot']);

Route::get('/users', [ReservationController::class, 'getUserss'])
    ->name('admin.api.users');

Route::get('/equipment', [ReservationController::class, 'getEquipment'])
    ->name('admin.api.equipment');

Route::get('/places', [PlacesController::class, 'getPlacesJson'])
    ->name('admin.api.places');

Route::post('/reservations/store', [ReservationController::class, 'storemobile'])
    ->name('reservations.store');


Route::middleware('auth:sanctum')->prefix('mobile')->group(function () {
    require __DIR__ . '/api/profile.php';
    require __DIR__ . '/api/posts.php';
    require __DIR__ . '/api/projects.php';
    require __DIR__ . '/api/reservations.php';
    require __DIR__ . '/api/leaderboard.php';
    require __DIR__ . '/api/search.php';
});
