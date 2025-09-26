<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified' , "role:admin"])->prefix('admin')->group(function () {
    
    Route::get('/users' , [UsersController::class , 'index'])->name('admin.users');
    Route::get('/users/{user}' , [UsersController::class , 'show'])->name('admin.users.show');
    Route::delete('/users/{user}', [UsersController::class, 'destroy'])->name('admin.users.destroy');
    Route::put('/users/{user}', [UsersController::class, 'update'])->name('admin.users.update');
});
