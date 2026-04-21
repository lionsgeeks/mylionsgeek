<?php

use App\Http\Controllers\Admin\LinkedInSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin'])->group(function () {
    Route::get('/admin/settings/linkedin', [LinkedInSettingsController::class, 'edit'])->name('admin.settings.linkedin');
    Route::post('/admin/settings/linkedin', [LinkedInSettingsController::class, 'update'])->name('admin.settings.linkedin.update');
});

