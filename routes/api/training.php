<?php

use App\Http\Controllers\API\TrainingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Training CRUD operations
    Route::get('/trainings', [TrainingController::class, 'index']);
    Route::get('/trainings/{id}', [TrainingController::class, 'show']);
    Route::post('/trainings', [TrainingController::class, 'store']);
    Route::put('/trainings/{id}', [TrainingController::class, 'update']);
    Route::delete('/trainings/{id}', [TrainingController::class, 'destroy']);
    
    // Student management
    Route::post('/trainings/{id}/students', [TrainingController::class, 'addStudent']);
    Route::delete('/trainings/{id}/students/{userId}', [TrainingController::class, 'removeStudent']);
    Route::post('/trainings/{id}/bulk-update-users', [TrainingController::class, 'bulkUpdateUsers']);
    
    // Attendance endpoints (accessible to admin and coach)
    Route::post('/attendances', [TrainingController::class, 'attendance']);
    Route::post('/attendance/save', [TrainingController::class, 'save']);
    Route::get('/trainings/{id}/attendance-events', [TrainingController::class, 'attendanceEvents']);
});
