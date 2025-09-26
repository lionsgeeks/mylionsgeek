<?php

use App\Http\Controllers\TrainingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/training', [TrainingController::class, 'index'])->name('training.index');
    Route::post('/admin/training', [TrainingController::class, 'store'])->name('training.store');
});

