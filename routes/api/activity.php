<?php

use App\Http\Controllers\API\UserActivityController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/activity', [UserActivityController::class, 'index']);
});
