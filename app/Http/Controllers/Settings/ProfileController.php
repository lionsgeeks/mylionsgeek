<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
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
        $user = $request->user();
        $data = $request->validated();

        // Check if user has 2FA enabled and is changing email
        if ($user->hasConfirmedTwoFactorAuthentication() && $request->has('email') && $request->email !== $user->email) {
            $request->validate([
                'two_factor_code' => ['required', 'string', 'size:6'],
            ]);

            // Verify the 2FA code
            $google2fa = app('pragmarx.google2fa');
            $secret = decrypt($user->two_factor_secret);

            if (! $google2fa->verifyKey($secret, $request->two_factor_code)) {
                return back()->withErrors([
                    'two_factor_code' => 'The provided two factor authentication code was invalid.',
                ]);
            }
        }

        // Handle avatar upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $data['image'] = '/storage/'.$path;
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

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
