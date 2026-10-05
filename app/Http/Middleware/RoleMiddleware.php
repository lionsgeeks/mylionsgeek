<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user('sanctum') ?? $request->user();

        if (! $user) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            return redirect('/');
        }

        // Handle pipe or comma separated roles
        if (count($roles) === 1 && (str_contains($roles[0], '|') || str_contains($roles[0], ','))) {
            $roles = preg_split('/[|,]/', $roles[0]);
        }

        $allowedRoles = array_map('trim', $roles);

        $userRoles = $user instanceof User
            ? $user->normalizedRoles()
            : (is_array($user->role) ? $user->role : [$user->role]);

        $hasAccess = ! empty(array_intersect($allowedRoles, $userRoles));

        if (! $hasAccess) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (in_array('student', $userRoles, true)) {
                return redirect()->route('student.feed');
            }
            if (in_array('admin', $userRoles, true)) {
                return redirect()->route('dashboard');
            }
            if (in_array('recruiter', $userRoles, true)) {
                return redirect()->route('recruiter.jobs.index');
            }

            return redirect()->route('profile.edit');
        }

        return $next($request);
    }
}
