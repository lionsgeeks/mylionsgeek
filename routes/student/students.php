<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified', 'role:admin,coach,student'])->group(function () {
    Route::get('/feed', [StudentController::class, 'index'])->name('student.feed');
    Route::get('/student/{id}', [StudentController::class, 'userProfile'])->name('student.feed');
    Route::post('/users/changeCover/{id}', [StudentController::class, 'changeCover']);
    Route::post('/users/changeProfileImage/{id}', [StudentController::class, 'changeProfileImage']);
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    Route::post('/users/follow/{user}', [StudentController::class, 'addToFollow']);
});
