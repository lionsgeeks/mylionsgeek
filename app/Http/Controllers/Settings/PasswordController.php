<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user has 2FA enabled
        if ($user->hasConfirmedTwoFactorAuthentication()) {
            $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', Password::defaults(), 'confirmed'],
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
        } else {
            $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', Password::defaults(), 'confirmed'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back();
    }
}
