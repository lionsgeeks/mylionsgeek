<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/feed', [StudentController::class , 'index'])->name('student.feed');
});

