<?php

use App\Http\Controllers\API\SearchController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/search', [SearchController::class, 'index']);
});

