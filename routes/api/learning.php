<?php

use App\Http\Controllers\API\LearningController;
use App\Http\Controllers\SendClassController;
use Illuminate\Support\Facades\Route;

Route::middleware("learning")->group(function()
{
    Route::get("/academy/token", [LearningController::class, "handleToken"]);
    Route::get("/academy/classes",[SendClassController::class, "GetClassesData"]);
});
