<?php

use App\Http\Controllers\TrainingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['role:admin'])->group(function () {
    Route::get('/training', [TrainingController::class, 'index'])->name('training.index');
});
