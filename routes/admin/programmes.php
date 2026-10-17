<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin,super_admin,moderateur,coach'])->group(function () {
    Route::get('/admin/programmes', function () {
        return Inertia::render('admin/programmes/index');
    })->name('admin.programmes.index');
});
