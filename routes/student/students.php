<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified', 'role:admin,coach,student,studio_responsable'])->group(function () {
    Route::get('/feed', [StudentController::class, 'index'])->name('student.feed');
    Route::get('/students/{id}', [StudentController::class, 'userProfile']);
    Route::post('/users/changeCover/{id}', [StudentController::class, 'changeCover']);
    Route::post('/users/changeProfileImage/{id}', [StudentController::class, 'changeProfileImage']);
    Route::put('/users/update/{user}', [UsersController::class, 'update']);
    Route::post('/users/follow/{user}', [StudentController::class, 'addToFollow']);
    Route::delete('/users/unfollow/{user}', [StudentController::class, 'unFollow']);
    Route::post('/users/about/{id}', [StudentController::class, 'updateAbout']);
    Route::post('/users/experience', [StudentController::class, 'createExperience']);
    Route::put('/users/experience/{id}', [StudentController::class, 'editExperience']);
    Route::delete('/users/experience/{id}', [StudentController::class, 'deleteExperience']);
    Route::post('/users/education', [StudentController::class, 'createEducation']);
    Route::put('/users/education/{id}', [StudentController::class, 'editEducation']);
    Route::delete('/users/education/{id}', [StudentController::class, 'deleteEducation']);
});
