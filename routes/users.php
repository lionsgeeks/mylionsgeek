<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', "role:admin"])->prefix('admin')->group(function () {

    Route::get('/users', [UsersController::class, 'index'])->name('admin.users');
    Route::get('/users/{user}', [UsersController::class, 'show'])->name('admin.users.edit');
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    // This route is specifically for updating the account_state of a user
    // Assuming this route exists in your `web.php` file
    Route::put('/users/update/{user}/account-state', [UsersController::class, 'updateAccountStatus']);
});
