<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GlobalAnalyticsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,moderateur,coach,studio_responsable,pro'])
    ->prefix('admin')
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('analytics/global', [GlobalAnalyticsController::class, 'index'])->name('admin.analytics.global');
    });
