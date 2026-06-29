<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SendClassController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api/notifications', [NotificationController::class, 'index'])->name('api.notifications');
    Route::post('/api/notifications/{type}/{id}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.mark-read');
    Route::post('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
    Route::get('/api/notifications/ably-token', [NotificationController::class, 'getAblyToken'])->name('api.notifications.ably-token');
});



