<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified', 'role:admin,coach,student,studio_responsable'])->prefix('students')->group(function () {
    Route::get('/feed', [StudentController::class, 'index'])->name('student.feed');
    Route::get('/{id}', [StudentController::class, 'userProfile']);
    Route::post('/changeCover/{id}', [StudentController::class, 'changeCover']);
    Route::post('/changeProfileImage/{id}', [StudentController::class, 'changeProfileImage']);
    Route::put('/update/{user}', [UsersController::class, 'update']);
    Route::post('/follow/{user}', [StudentController::class, 'addToFollow']);
    Route::delete('/unfollow/{user}', [StudentController::class, 'unFollow']);
    Route::post('/about/{id}', [StudentController::class, 'updateAbout']);
    Route::post('/social-links', [StudentController::class, 'createSocialLink']);
    Route::put('/social-links/{id}', [StudentController::class, 'updateSocialLink']);
    Route::delete('/social-links/{id}', [StudentController::class, 'deleteSocialLink']);
    Route::post('/social-links/reorder', [StudentController::class, 'reorderSocialLinks']);
    Route::post('/experience', [StudentController::class, 'createExperience']);
    Route::put('/experience/{id}', [StudentController::class, 'editExperience']);
    Route::delete('/experience/{id}', [StudentController::class, 'deleteExperience']);
    Route::post('/education', [StudentController::class, 'createEducation']);
    Route::put('/education/{id}', [StudentController::class, 'editEducation']);
    Route::delete('/education/{id}', [StudentController::class, 'deleteEducation']);
});
