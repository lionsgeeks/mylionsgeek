<?php

use App\Http\Controllers\AdminProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,coach'])->prefix('admin')->name('admin.')->group(function () {
    // Get user projects
    Route::get('/users/{user}/projects', [AdminProjectController::class, 'getUserProjects'])->name('users.projects');
    
    // Approve and reject (matching ShowModal URLs exactly!)
    Route::post('/projects/{project}/approve', [AdminProjectController::class, 'approve'])->name('projects.approve');
    Route::post('/projects/{project}/reject', [AdminProjectController::class, 'reject'])->name('projects.reject');
});
