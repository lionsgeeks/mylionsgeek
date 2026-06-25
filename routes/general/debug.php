<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

if (app()->environment('local')) {
    Route::get('/debug-ip', function (Request $request) {
        return response()->json([
            'ip' => $request->ip(),
            'ips' => $request->ips(),
            'x_forwarded_for' => $request->header('X-Forwarded-For'),
            'remote_addr' => $request->server('REMOTE_ADDR'),
        ]);
    });
}
