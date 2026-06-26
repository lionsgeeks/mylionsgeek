<?php

use App\Http\Controllers\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('/admin')->group(function () {
    // get send notification for web
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    // post send notification for 
    Route::post('/announcements/store', [AnnouncementController::class, 'store']);
    // update send notification for 
    Route::put('/announcements/update/{id}', [AnnouncementController::class, 'update']);
    // delete send notification for 
    Route::delete('/announcements/destroy/{id}', [AnnouncementController::class, 'destroy']);
});
