<?php

use App\Http\Controllers\Admin\PostReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,super_admin,moderateur,coach,studio_responsable'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/post-reports', [PostReportController::class, 'index'])->name('admin.post-reports.index');
        Route::get('/post-reports/{report}', [PostReportController::class, 'show'])
            ->whereNumber('report')
            ->name('admin.post-reports.show');

        Route::post('/post-reports/{report}/accept', [PostReportController::class, 'accept'])
            ->whereNumber('report')
            ->name('admin.post-reports.accept');
        Route::post('/post-reports/{report}/refuse', [PostReportController::class, 'refuse'])
            ->whereNumber('report')
            ->name('admin.post-reports.refuse');
    });

