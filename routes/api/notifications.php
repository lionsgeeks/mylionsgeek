<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/{type}/{id}/read', [NotificationController::class, 'markAsRead']);
Route::get('/notifications/ably-token', [NotificationController::class, 'getAblyToken']);
