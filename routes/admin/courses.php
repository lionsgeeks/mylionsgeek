<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin,moderateur'])->group(function () {
    Route::post('/admin/courses', [CourseController::class, 'store'])->name('courses.store');
});
