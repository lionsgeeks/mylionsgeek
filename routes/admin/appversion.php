<?php

use App\Http\Controllers\Admin\AppVersionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin'])->group(function () {
    Route::get('/admin/appversion', [AppVersionController::class, 'edit'])->name('admin.appversion');
    Route::post('/admin/appversion', [AppVersionController::class, 'update'])->name('admin.appversion.update');
    Route::post('/admin/appversion/modals', [AppVersionController::class, 'storeModal'])->name('admin.appversion.modals.store');
    Route::post('/admin/appversion/modals/{appBlockModal}/active', [AppVersionController::class, 'setActive'])->name('admin.appversion.modals.active');
});
