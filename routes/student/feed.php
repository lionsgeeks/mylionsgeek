<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/feed', function () {
        return Inertia::render('student/feed');
    })->name('student.feed');
});

