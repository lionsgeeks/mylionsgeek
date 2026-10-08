<?php

namespace App\Http\Controllers\Organisation;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganisationMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        if (! $user?->canManageOrganisationMembers()) {
            abort(403);
        }

        $organization = $user->organisationAccount;
        if (! $organization) {
            abort(403);
        }

        $employers = $organization->employers()
            ->orderByDesc('organization_user.created_at')
            ->get()
            ->map(fn (User $employer) => [
                'id' => $employer->id,
                'name' => $employer->name,
                'email' => $employer->email,
                'member_role' => $employer->pivot->member_role,
                'created_at' => $employer->pivot->created_at?->toIso8601String(),
                'last_online' => $employer->last_online,
            ]);

        return Inertia::render('organisation/members/index', [
            'organization' => [
                'id' => $organization->id,
                'display_name' => $organization->displayName(),
            ],
            'employers' => $employers,
        ]);
    }
}
