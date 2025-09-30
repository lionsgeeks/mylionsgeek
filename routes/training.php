<?php

use App\Http\Controllers\FormationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/training', [FormationController::class, 'index'])->name('training.index');
    Route::post('/admin/training', [FormationController::class, 'store'])->name('training.store');
    Route::get('/trainings/{training}', [FormationController::class, 'show'])->name('trainings.show');

});

