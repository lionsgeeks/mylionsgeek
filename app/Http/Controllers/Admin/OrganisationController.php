<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrganisationInvitedMail;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganisationController extends Controller
{
    public function index(): Response
    {
        $organisations = Organization::query()
            ->with(['accountUser:id,name,email,image,last_online'])
            ->withCount('employers')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Organization $org) => [
                'id' => $org->id,
                'email' => $org->email,
                'enterprise_name' => $org->enterprise_name,
                'contact_name' => $org->contact_name,
                'sector' => $org->sector,
                'location' => $org->location,
                'phone' => $org->phone,
                'linkedin_url' => $org->linkedin_url,
                'account_state' => (int) $org->account_state,
                'onboarding_completed' => $org->hasCompletedOnboarding(),
                'onboarding_completed_at' => $org->onboarding_completed_at?->toIso8601String(),
                'created_at' => $org->created_at?->toIso8601String(),
                'employers_count' => $org->employers_count,
                'account' => $org->accountUser ? [
                    'id' => $org->accountUser->id,
                    'name' => $org->accountUser->name,
                    'email' => $org->accountUser->email,
                    'image' => $org->accountUser->image,
                    'last_online' => $org->accountUser->last_online,
                ] : null,
            ]);

        return Inertia::render('admin/organisations/index', [
            'organisations' => $organisations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:organizations,email|unique:users,email',
        ]);

        $plainPassword = Str::password(14);
        $email = strtolower(trim($validated['email']));
        $displayName = Str::before($email, '@');

        $user = DB::transaction(function () use ($request, $email, $displayName, $plainPassword): User {
            $organization = Organization::create([
                'email' => $email,
                'invited_by' => $request->user()?->id,
                'account_state' => 0,
            ]);

            $lastUser = User::query()->orderByDesc('id')->first();
            $nextId = $lastUser ? ((int) $lastUser->id) + 1 : 1;

            $accountUser = User::create([
                'id' => $nextId,
                'name' => $displayName,
                'email' => $email,
                'password' => $plainPassword,
                'must_change_password' => true,
                'phone' => null,
                'image' => 'pdp.png',
                'status' => 'Working',
                'cin' => null,
                'formation_id' => null,
                'account_state' => 0,
                'access_studio' => 0,
                'access_cowork' => 0,
                'role' => ['recruiter'],
                'email_verified_at' => now(),
                'activation_token' => null,
            ]);

            $organization->update(['account_user_id' => $accountUser->id]);

            return $accountUser;
        });

        try {
            Mail::to($user->email)->send(new OrganisationInvitedMail($user, $plainPassword));
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()->back()->with(
                'warning',
                'Organisation invited, but the invitation email could not be sent. Check your mail configuration.'
            );
        }

        return redirect()->back()->with('success', 'Organisation account created. Login details were sent by email.');
    }

    public function updateAccountState(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'account_state' => 'required|integer|in:0,1',
        ]);

        $organization->update(['account_state' => $validated['account_state']]);

        $organization->load('employers');

        $userIds = collect([$organization->account_user_id])
            ->merge($organization->employers->pluck('id'))
            ->filter()
            ->unique()
            ->values();

        if ($userIds->isNotEmpty()) {
            User::query()->whereIn('id', $userIds)->update(['account_state' => $validated['account_state']]);
        }

        return redirect()->back()->with('success', 'Organisation account status updated.');
    }
}
