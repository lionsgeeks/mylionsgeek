<?php

use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\ReservationsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservationsCowork', [ReservationController::class, 'indexcowork']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
});
