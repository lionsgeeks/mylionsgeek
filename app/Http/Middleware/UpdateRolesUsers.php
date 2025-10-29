<?php

namespace App\Http\Middleware;

use App\Models\Formation;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;

class UpdateRolesUsers
{
    public function handle(Request $request, Closure $next)
    {

        $formations = Formation::with('users')->whereNotNull('start_time')->get();

        foreach ($formations as $formation) {
            $months = Carbon::parse($formation->start_time)->diffInMonths(Carbon::now());

            if ($months > 6) {
                foreach ($formation->users as $user) {
                    if ($user->role === 'student') {
                        // $user->role = 'Graduated';
                        $user->save();
                    }
                }
            }
        }

        return $next($request);
    }
}
