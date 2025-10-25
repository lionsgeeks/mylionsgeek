<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle avatar upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $data['image'] = $path; // Store just the path without /storage/ prefix
        }

        // Only update the fields that are actually in the database
        $allowedFields = ['name', 'email', 'phone', 'cin', 'wakatime_api_key', 'image'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        // Use a fresh user instance to avoid virtual attributes
        $userId = $request->user()->id;
        User::where('id', $userId)->update($updateData);

        // Check if email was changed and reset verification
        if (isset($updateData['email']) && $updateData['email'] !== $request->user()->getOriginal('email')) {
            User::where('id', $userId)->update(['email_verified_at' => null]);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->update(['account_state' => 1]);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
