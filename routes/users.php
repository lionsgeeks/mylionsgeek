<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', "role:admin"])->prefix('admin')->group(function () {

    Route::get('/users', [UsersController::class, 'index'])->name('admin.users');
    Route::post('/users/store', [UsersController::class, 'store'])->name('admin.store');
    Route::get('/users/{user}', [UsersController::class, 'show'])->name('admin.users.edit');
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    Route::put('/users/update/{user}/account-state', [UsersController::class, 'updateAccountStatus']);
});
