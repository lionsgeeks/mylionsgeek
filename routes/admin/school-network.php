<?php

use App\Http\Controllers\Admin\SchoolNetworkController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin,super_admin'])->group(function () {
    Route::get('/admin/school-network', [SchoolNetworkController::class, 'edit'])->name('admin.school-network');
    Route::post('/admin/school-network', [SchoolNetworkController::class, 'update'])->name('admin.school-network.update');
});
