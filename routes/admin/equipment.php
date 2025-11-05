<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EquipmentTypeController;

Route::middleware(['auth','verified','role:admin'])->prefix('admin')->group(function () {
    // Equipment routes
    Route::get('/equipements', [EquipmentController::class, 'index'])->name('admin.equipment');
    Route::post('/equipements', [EquipmentController::class, 'store'])->name('admin.equipment.store');
    Route::put('/equipements/{equipment}', [EquipmentController::class, 'update'])->name('admin.equipment.update');
    Route::delete('/equipements/{equipment}', [EquipmentController::class, 'destroy'])->name('admin.equipment.destroy');
    Route::get('/equipements/{equipment}/history', [EquipmentController::class, 'history'])->name('admin.equipment.history');
    Route::get('/equipements/{equipment}/usage-activities', [EquipmentController::class, 'usageActivities'])->name('admin.equipment.usage');
    Route::get('/equipements/{equipment}/notes', [EquipmentController::class, 'notes'])->name('admin.equipment.notes');
    
    // Equipment Type management routes
    Route::get('/equipment-types', [EquipmentTypeController::class, 'index'])->name('admin.equipment-types.index');
    Route::post('/equipment-types', [EquipmentTypeController::class, 'store'])->name('admin.equipment-types.store');
    Route::put('/equipment-types/{equipmentType}', [EquipmentTypeController::class, 'update'])->name('admin.equipment-types.update');
    Route::delete('/equipment-types/{equipmentType}', [EquipmentTypeController::class, 'destroy'])->name('admin.equipment-types.destroy');
});


