<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganisationOnboarded
{
    /**
     * Recruiters linked to an organisation must complete onboarding before using the recruiter area.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isRecruiter()) {
            return $next($request);
        }

        $organization = $user->organization;

        if (! $organization) {
            return $next($request);
        }

        if ($organization->hasCompletedOnboarding()) {
            return $next($request);
        }

        if ($request->routeIs('organisation.onboarding', 'organisation.onboarding.store', 'logout')) {
            return $next($request);
        }

        return redirect()->route('organisation.onboarding');
    }
}
