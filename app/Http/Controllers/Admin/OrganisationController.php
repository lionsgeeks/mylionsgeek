<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrganisationInvitedMail;
use App\Models\Organization;
use App\Models\User;
use App\Support\SendsCredentialsMailAfterResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganisationController extends Controller
{
    public function index(): Response
    {
        $organisations = Organization::query()
            ->with(['accountUser:id,name,email,image,last_online,activation_token,activation_token_expires_at'])
            ->withCount('employers')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Organization $org) {
                $invitation = $this->invitationState($org->accountUser);

                return [
                    'id' => $org->id,
                    'email' => $org->email,
                    'enterprise_name' => $org->enterprise_name,
                    'contact_name' => $org->contact_name,
                    'sector' => $org->sector,
                    'location' => $org->location,
                    'phone' => $org->phone,
                    'account_state' => (int) $org->account_state,
                    'onboarding_completed' => $org->hasCompletedOnboarding(),
                    'onboarding_completed_at' => $org->onboarding_completed_at?->toIso8601String(),
                    'created_at' => $org->created_at?->toIso8601String(),
                    'employers_count' => $org->employers_count,
                    'invitation_status' => $invitation['invitation_status'],
                    'invitation_expired' => $invitation['invitation_expired'],
                    'account' => $org->accountUser ? [
                        'id' => $org->accountUser->id,
                        'name' => $org->accountUser->name,
                        'email' => $org->accountUser->email,
                        'image' => $org->accountUser->image,
                        'last_online' => $org->accountUser->last_online,
                    ] : null,
                ];
            });

        return Inertia::render('admin/organisations/index', [
            'organisations' => $organisations,
        ]);
    }

    public function show(Organization $organization): Response
    {
        $organization->load([
            'accountUser:id,name,email,image,last_online,account_state,status,activation_token,activation_token_expires_at',
            'employers' => fn ($query) => $query->orderByDesc('organization_user.created_at'),
        ]);

        $teamMembers = collect();

        if ($organization->accountUser) {
            $account = $organization->accountUser;
            $teamMembers->push([
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'image' => $account->image,
                'last_online' => $account->last_online,
                'status' => $account->status,
                'account_state' => (int) $account->account_state,
                'member_role' => 'owner',
                'member_label' => 'Organisation owner',
                'joined_at' => $organization->created_at?->toIso8601String(),
            ]);
        }

        foreach ($organization->employers as $employer) {
            $teamMembers->push([
                'id' => $employer->id,
                'name' => $employer->name,
                'email' => $employer->email,
                'image' => $employer->image,
                'last_online' => $employer->last_online,
                'status' => $employer->status,
                'account_state' => (int) $employer->account_state,
                'member_role' => $employer->pivot->member_role,
                'member_label' => ucfirst((string) ($employer->pivot->member_role ?? 'employer')),
                'joined_at' => $employer->pivot->created_at?->toIso8601String(),
            ]);
        }

        $invitation = $this->invitationState($organization->accountUser);

        return Inertia::render('admin/organisations/[id]', [
            'organization' => [
                'id' => $organization->id,
                'email' => $organization->email,
                'enterprise_name' => $organization->enterprise_name,
                'contact_name' => $organization->contact_name,
                'sector' => $organization->sector,
                'location' => $organization->location,
                'phone' => $organization->phone,
                'account_state' => (int) $organization->account_state,
                'onboarding_completed' => $organization->hasCompletedOnboarding(),
                'display_name' => $organization->displayName(),
                'employers_count' => $organization->employers->count(),
                'invitation_status' => $invitation['invitation_status'],
                'invitation_expired' => $invitation['invitation_expired'],
            ],
            'teamMembers' => $teamMembers->values()->all(),
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

            $accountUser = new User;
            $accountUser->forceFill([
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
                'invite_source' => 'organisation',
                'email_verified_at' => now(),
            ])->save();

            $organization->update(['account_user_id' => $accountUser->id]);

            return $accountUser;
        });

        $plainToken = $user->issueActivationToken();
        $completeProfileUrl = URL::temporarySignedRoute(
            'organisation.invitation',
            now()->addHours(User::ACTIVATION_TTL_HOURS),
            ['token' => $plainToken],
        );

        SendsCredentialsMailAfterResponse::send(
            $user->email,
            new OrganisationInvitedMail($user, $completeProfileUrl),
        );

        return redirect()->back()->with(
            'success',
            'Organisation account created. An invitation email is being sent.',
        );
    }

    public function resendInvitation(Organization $organization): RedirectResponse
    {
        $account = $organization->accountUser;

        if (! $account) {
            return back()->with('banner_error', 'This organisation has no account to invite.');
        }

        if (! $account->hasPendingActivation()) {
            return back()->with('banner_error', 'This invitation has already been accepted.');
        }

        $plainToken = $account->issueActivationToken();
        $completeProfileUrl = URL::temporarySignedRoute(
            'organisation.invitation',
            now()->addHours(User::ACTIVATION_TTL_HOURS),
            ['token' => $plainToken],
        );

        try {
            Mail::to($account->email)->send(new OrganisationInvitedMail($account, $completeProfileUrl));
        } catch (\Throwable $exception) {
            report($exception);

            return back()->with('banner_error', 'The invitation email could not be sent. Use Resend invitation to try again.');
        }

        return back()->with('banner_success', 'Invitation email sent.');
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

    /**
     * Pending while the activation token still exists, including after it expires.
     * Accepted once that token has been consumed.
     *
     * @return array{invitation_status: 'pending'|'accepted'|null, invitation_expired: bool}
     */
    private function invitationState(?User $account): array
    {
        if (! $account || ! $account->hasPendingActivation()) {
            return [
                'invitation_status' => $account ? 'accepted' : null,
                'invitation_expired' => false,
            ];
        }

        $expiresAt = $account->activation_token_expires_at;

        return [
            'invitation_status' => 'pending',
            'invitation_expired' => $expiresAt !== null && $expiresAt->isPast(),
        ];
    }
}
