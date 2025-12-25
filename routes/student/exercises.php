<?php

use App\Http\Controllers\ExerciseSubmissionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/student/exercises', [ExerciseSubmissionController::class, 'index'])->name('student.exercises.index');
    Route::post('/student/exercises/submit', [ExerciseSubmissionController::class, 'store'])->name('student.exercises.submit');
    Route::delete('/student/exercises/submissions/{id}', [ExerciseSubmissionController::class, 'destroy'])->name('student.exercises.submissions.destroy');
});

