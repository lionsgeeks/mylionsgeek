<?php

use App\Http\Controllers\ExercicesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin,moderateur,coach'])->group(function () {
    Route::get('/admin/exercices', [ExercicesController::class, 'index'])->name('exercices.index');
    Route::post('/admin/exercices', [ExercicesController::class, 'store'])->name('exercices.store');
    Route::delete('/admin/exercices/{exercices}', [ExercicesController::class, 'destroy'])->name('exercices.destroy');
});

