<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $user = User::where('email', $request->email)->first();

        if (! $user || $user->account_state) {
            // If account is deleted or suspended, return an error message
            return response()->json([
                'errors' => [
                    'email' => 'Your account has been deleted. Please contact administration.',
                ],
            ], 403);
        }

        // Check if user has 2FA enabled
        if ($user->hasConfirmedTwoFactorAuthentication()) {
            // Store user ID in session for 2FA verification
            $request->session()->put('login.id', $user->id);
            Auth::logout();

            return Inertia::render('auth/two-factor-challenge');
        }

        $request->session()->regenerate();
        $user->forceFill([
            'last_online' => now(),
        ])->save();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Handle 2FA verification during login.
     */
    public function verifyTwoFactor(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = $request->session()->get('login.id');
        if (! $userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (! $user) {
            return redirect()->route('login');
        }

        // Verify the 2FA code (TOTP) or accept a valid recovery code
        $google2fa = app('pragmarx.google2fa');
        $secret = decrypt($user->two_factor_secret);

        $totpValid = $google2fa->verifyKey($secret, $request->code);

        $recoveryValid = false;
        if (! $totpValid) {
            $codes = json_decode(decrypt($user->two_factor_recovery_codes), true) ?? [];
            if (in_array($request->code, $codes, true)) {
                $recoveryValid = true;
                // Consume the used recovery code
                $user->replaceRecoveryCode($request->code);
            }
        }

        if (! $totpValid && ! $recoveryValid) {
            return back()->withErrors([
                'code' => 'The provided authentication code is invalid.',
            ]);
        }

        // 2FA verification successful, log the user in
        Auth::login($user);
        $request->session()->forget('login.id');
        $request->session()->regenerate();

        $user->forceFill([
            'last_online' => now(),
        ])->save();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
