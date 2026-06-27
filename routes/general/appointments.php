<?php

use App\Http\Controllers\ReservationsController;
use Illuminate\Support\Facades\Route;

Route::get('/appointments/{token}/approve', [ReservationsController::class, 'approveAppointment'])->name('appointments.approve');
Route::get('/appointments/{token}/cancel', [ReservationsController::class, 'cancelAppointment'])->name('appointments.cancel');
Route::get('/appointments/{token}/suggest', [ReservationsController::class, 'showAppointmentSuggestForm'])->name('appointments.suggest');
Route::post('/appointments/{token}/suggest', [ReservationsController::class, 'submitAppointmentSuggestForm'])->name('appointments.suggest.submit');
Route::get('/appointments/suggest/{token}/accept', [ReservationsController::class, 'acceptSuggestedTime'])->name('appointments.suggest.accept');
