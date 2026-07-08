<?php

use App\Http\Controllers\Admin\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('/admin')->group(function () {
    Route::get('/newsletter', [NewsletterController::class, 'index']);
});
