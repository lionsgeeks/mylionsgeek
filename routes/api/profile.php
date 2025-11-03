<?php

use App\Http\Controllers\API\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::get('/profile/{userId}', [ProfileController::class, 'show']);
});

