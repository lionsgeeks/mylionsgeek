<?php

use App\Http\Controllers\FormationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/training', [FormationController::class, 'index'])->name('training.index');
    Route::post('/admin/training', [FormationController::class, 'store'])->name('training.store');
    Route::get('/trainings/{training}', [FormationController::class, 'show'])->name('trainings.show');
    Route::post('/trainings/{training}/students', [FormationController::class, 'addStudent'])->name('trainings.students.add');
    Route::delete('/trainings/{training}/students/{user}', [FormationController::class, 'removeStudent'])->name('trainings.students.remove');
    Route::delete('/trainings/{training}', [FormationController::class, 'destroy'])->name('trainings.destroy');
    Route::put('/trainings/{training}', [FormationController::class, 'update'])->name('trainings.update');
});

// Attendance endpoints accessible to admin and coach
Route::middleware(['auth', 'role:admin|coach'])->group(function () {
    Route::post('/admin/attendance/save', [FormationController::class, 'save'])->name('attendance.save');
    Route::post('/attendances', [FormationController::class, 'attendance'])->name('attendances');
    Route::get('/training/{training}/attendance-events', [FormationController::class, 'attendanceEvents'])->name('attendance.events');
});
