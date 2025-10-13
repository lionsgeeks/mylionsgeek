<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', "role:admin"])->prefix('admin')->group(function () {

    Route::get('/users', [UsersController::class, 'index']);
    Route::get('/users/export', [UsersController::class, 'export']);
    Route::get('/users/{user}', [UsersController::class, 'show']);
    Route::get('/users/{user}/attendance-summary', [UsersController::class, 'attendanceSummary']);
    Route::get('/users/{user}/notes', [UsersController::class, 'notes']);
    Route::post('/users/{user}/notes', [UsersController::class, 'storeNote']);
    Route::post('/users/store', [UsersController::class, 'store']);
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    Route::put('/users/update/{user}/account-state', [UsersController::class, 'updateAccountStatus']);
});
