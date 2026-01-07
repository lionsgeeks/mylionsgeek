<?php

use App\Http\Controllers\ExerciseSubmissionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/students/exercises', [ExerciseSubmissionController::class, 'index'])->name('student.exercises.index');
    Route::post('/students/exercises/submit', [ExerciseSubmissionController::class, 'store'])->name('student.exercises.submit');
    Route::delete('/students/exercises/submissions/{id}', [ExerciseSubmissionController::class, 'destroy'])->name('student.exercises.submissions.destroy');
    Route::post('/students/exercises/submissions/{id}/request-review', [ExerciseSubmissionController::class, 'requestReview'])->name('student.exercises.submissions.request-review');
});

