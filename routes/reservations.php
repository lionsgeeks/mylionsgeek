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
    Route::get('/places/{type}/{id}/reservations', [ReservationsController::class, 'byPlace'])
        ->name('admin.places.reservations');
});



