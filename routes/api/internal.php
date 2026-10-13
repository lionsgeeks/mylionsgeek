<?php

use App\Http\Controllers\API\EventPushWebhookController;
use App\Http\Controllers\API\StudentInviteController;
use Illuminate\Support\Facades\Route;

// Server-to-server webhook from lionsgeek.ma when a public event is created.
// Auth: bearer token must match LIONSGEEK_MA_API_KEY (same as General.token).
Route::post('/internal/event-created', [EventPushWebhookController::class, 'eventCreated']);

// lionsgeek.ma queues this after an admin opens the promo invite route.
// Auth: bearer token must match LIONSGEEK_MA_API_KEY.
Route::post('/internal/student-confirmed', [StudentInviteController::class, 'store']);
