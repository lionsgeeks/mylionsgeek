<?php

use App\Http\Controllers\API\LearningController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->get(env('CENTRAL_AUTH_ACADEMY'), [LearningController::class, 'redirectCode']);
