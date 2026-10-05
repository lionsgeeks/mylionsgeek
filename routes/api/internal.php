<?php

use App\Http\Controllers\API\EventPushWebhookController;
use Illuminate\Support\Facades\Route;

// Server-to-server webhook from lionsgeek.ma when a public event is created.
// Auth: bearer token must match LIONSGEEK_MA_API_KEY (same as General.token).
Route::post('/internal/event-created', [EventPushWebhookController::class, 'eventCreated']);
