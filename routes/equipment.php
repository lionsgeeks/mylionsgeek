<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipmentController;

Route::middleware(['auth','verified','role:admin'])->prefix('admin')->group(function () {
    // Keep route names the same so existing code using route('admin.equipment*') works
    Route::get('/equipements', [EquipmentController::class, 'index'])->name('admin.equipment');
    Route::post('/equipements', [EquipmentController::class, 'store'])->name('admin.equipment.store');
    Route::put('/equipements/{equipment}', [EquipmentController::class, 'update'])->name('admin.equipment.update');
    Route::delete('/equipements/{equipment}', [EquipmentController::class, 'destroy'])->name('admin.equipment.destroy');
});


