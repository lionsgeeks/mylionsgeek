<?php

use App\Http\Controllers\PlacesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,super_admin,moderateur'])->prefix('admin')->group(function () {
    Route::get('/places', [PlacesController::class, 'index'])->name('admin.places');
    Route::post('/places', [PlacesController::class, 'store'])->name('admin.places.store');
    Route::put('/places/{place}', [PlacesController::class, 'update'])->name('admin.places.update');
    Route::delete('/places/{place}', [PlacesController::class, 'destroy'])->name('admin.places.destroy');
});
