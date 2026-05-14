<?php

namespace App\Http\Controllers\Organisation;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganisationOnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $organization = $user?->organization;

        if (! $user?->isRecruiter() || ! $organization) {
            abort(403);
        }

        if ($organization->hasCompletedOnboarding()) {
            return redirect()->route('recruiter.dashboard');
        }

        return Inertia::render('organisation/onboarding/index', [
            'organization' => [
                'email' => $organization->email,
                'contact_name' => $organization->contact_name,
                'enterprise_name' => $organization->enterprise_name,
                'sector' => $organization->sector,
                'location' => $organization->location,
                'linkedin_url' => $organization->linkedin_url,
                'phone' => $organization->phone,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $organization = $user?->organization;

        if (! $user?->isRecruiter() || ! $organization) {
            abort(403);
        }

        if ($organization->hasCompletedOnboarding()) {
            return redirect()->route('recruiter.dashboard');
        }

        $validated = $request->validate([
            'contact_name' => ['required', 'string', 'max:255'],
            'enterprise_name' => ['required', 'string', 'max:255'],
            'sector' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:500', 'url'],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $organization->update([
            'contact_name' => $validated['contact_name'],
            'enterprise_name' => $validated['enterprise_name'],
            'sector' => $validated['sector'],
            'location' => $validated['location'],
            'linkedin_url' => $validated['linkedin_url'] ?? null,
            'phone' => $validated['phone'],
            'onboarding_completed_at' => now(),
        ]);

        $user->update([
            'name' => $validated['contact_name'],
            'phone' => $validated['phone'],
        ]);

        return redirect()->route('recruiter.dashboard')->with('success', __('Your organisation profile is complete.'));
    }
}
