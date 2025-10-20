<?php

// app/Http/Middleware/UpdateLastOnline.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UpdateLastOnline
{
    public function handle($request, Closure $next)
    {
        if (Auth::check()) {
            Auth::user()->forceFill(['last_online' => Carbon::now()])->save();
        }
        return $next($request);
    }
}
