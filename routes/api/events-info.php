<?php

use App\Http\Controllers\API\EventsInfoProxyController;
use Illuminate\Support\Facades\Route;

/*
 * Proxy routes for the public LionsGeek site (lionsgeek.ma). These let a mobile
 * device on the local network read events through this server. Auth to the
 * upstream is handled server-side with the shared key, so these stay public.
 *
 * Mounted under the global /api prefix => final paths are /api/events-info/*.
 */
Route::prefix('events-info')->group(function () {
    Route::get('/events', [EventsInfoProxyController::class, 'events']);
    Route::get('/events/{event}', [EventsInfoProxyController::class, 'event']);
    Route::put('/validate-event-invitation', [EventsInfoProxyController::class, 'validateEventInvitation']);
});
