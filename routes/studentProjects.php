<?php

use App\Http\Controllers\StudentProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    // Student projects routes
    Route::get('/projects', [StudentProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [StudentProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{userProject}', [StudentProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{userProject}', [StudentProjectController::class, 'destroy'])->name('projects.destroy');
});
