<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyLearning
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $api_key = $request->header("x-api-key");
        if ($api_key !== env("LEARNING_CLIENT_SECRET")) {
            return response()->json([
                "status" => "error",
                "message" => "unauthorized"
            ], 401);
        }
        return $next($request);
    }
}
