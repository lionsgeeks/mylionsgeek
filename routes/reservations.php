<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationsController;

Route::middleware(['auth','verified','role:admin'])->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationsController::class, 'index'])->name('admin.reservations');
});



