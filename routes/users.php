<?php

use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified' , "role:admin"])->prefix('admin')->group(function () {
    
    Route::get('/users' , [UsersController::class , 'index'])->name('admin.users');
});
