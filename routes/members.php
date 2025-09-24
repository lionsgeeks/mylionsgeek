<?php

use App\Http\Controllers\MemberController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    
    Route::get('/members' , [MemberController::class , 'index'])->name('admin.members');
});
