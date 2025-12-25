<?php

use App\Http\Controllers\ModelsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin,moderateur'])->group(function () {
    Route::post('/admin/models', [ModelsController::class, 'store'])->name('models.store');
});


