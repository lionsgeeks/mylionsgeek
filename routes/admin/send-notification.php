<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth','role:admin,super_admin,'])->group(function () {
    Route::get('/admin/send-notification', function () {
        return Inertia::render('admin/send-notification/index');
    })->name('admin.send-notification');
});


