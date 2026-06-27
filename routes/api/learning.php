<?php

use App\Http\Controllers\API\LearningController;
use App\Http\Controllers\SendClassController;
use App\Http\Controllers\SendSocialsController;
use App\Http\Controllers\SendWakaTimeController;
use Illuminate\Support\Facades\Route;

Route::middleware("learning")->group(function()
{
    Route::get("/academy/token", [LearningController::class, "handleToken"]);
    Route::get("/academy/classes",[SendClassController::class, "GetClassesData"]);
    Route::get("/academy/socials",[SendSocialsController::class, "send"]);
    Route::get("/academy/wakatime",[SendWakaTimeController::class, "send"]);
    });
