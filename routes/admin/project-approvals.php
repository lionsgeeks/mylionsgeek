<?php

use App\Http\Controllers\StudentProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,coach'])->prefix('admin')->name('admin.')->group(function () {
    // Get user projects
    Route::get('/users/{user}/projects', [StudentProjectController::class, 'getUserProjects'])->name('users.projects');
    Route::post('/projects/{studentProject}/approve', [StudentProjectController::class, 'approve'])->name('projects.approve');
    Route::post('/projects/{studentProject}/reject', [StudentProjectController::class, 'reject'])->name('projects.reject');
});
