<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganisationOnboarded
{
    /**
     * Organisation accounts must complete onboarding before using the hiring area.
     * Employer accounts skip onboarding (only the org account completes company profile).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isRecruiter()) {
            return $next($request);
        }

        if (! $user->isOrganisationAccount()) {
            return $next($request);
        }

        $organization = $user->organisationAccount;

        if (! $organization) {
            return $next($request);
        }

        $isReady = $organization->hasCompletedOnboarding() && ! $user->must_change_password;

        if ($isReady) {
            return $next($request);
        }

        if ($request->routeIs('organisation.onboarding', 'organisation.onboarding.validate', 'organisation.onboarding.store', 'logout')) {
            return $next($request);
        }

        return redirect()->route('organisation.onboarding');
    }
}
