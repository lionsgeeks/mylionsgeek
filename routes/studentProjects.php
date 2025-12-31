<?php

use App\Http\Controllers\StudentProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student projects routes
    Route::get('/student/projects', [StudentProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [StudentProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{studentProject}', [StudentProjectController::class, 'update'])->middleware('auth')->name('projects.update');
});

// Project show route - accessible to both students and admins
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/student/project/{studentProject}', [StudentProjectController::class, 'show'])->name('projects.show');
});
