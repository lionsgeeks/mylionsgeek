<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationsController;

Route::middleware(['auth','verified','role:admin'])->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationsController::class, 'index'])->name('admin.reservations');
    Route::post('/reservations/{reservation}/approve', [ReservationsController::class, 'approve'])
        ->name('admin.reservations.approve');
    Route::post('/reservations/{reservation}/cancel', [ReservationsController::class, 'cancel'])
        ->name('admin.reservations.cancel');
    Route::get('/reservations/{reservation}/info', [ReservationsController::class, 'info'])
        ->name('admin.reservations.info');
    Route::get('/reservations/{reservation}/pdf', [ReservationsController::class, 'generatePdf'])
        ->name('admin.reservations.pdf');
    Route::get('/places/{type}/{id}/reservations', [ReservationsController::class, 'byPlace'])
        ->name('admin.places.reservations');

    // Store reservation with teams & equipment
    Route::post('/reservations/store', [ReservationsController::class, 'store'])
        ->name('admin.reservations.store');
    
    // Get users for team member selector
    Route::get('/api/users', [ReservationsController::class, 'getUsers'])
        ->name('admin.api.users');
    
    // Get equipment for equipment selector
    Route::get('/api/equipment', [ReservationsController::class, 'getEquipment'])
        ->name('admin.api.equipment');
    
    // Studio calendar page
    Route::get('/studios/{studio}/calendar', [ReservationsController::class, 'studioCalendar'])
        ->name('admin.studios.calendar');
});



