<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
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

        // $user = User::active()->where('email', $request->email)->first();

        // if (!$user) {
        //     throw ValidationException::withMessages([
        //         'email' => 'This account has been deactivated.',
        //     ]);
        // }
        $request->authenticate();
        $user = User::where('email', $request->email)->first();

        if (!$user || $user->account_state) {
            // If account is deleted or suspended, return an error message
            return response()->json([
                'errors' => [
                    'email' => 'Your account has been deleted. Please contact administration.'
                ]
            ], 403);
        }

        $request->session()->regenerate();
        $user->forceFill([
            'last_online' => now()
        ])->save();

        // Role-based redirect + force reload
        if ($user->role === 'student') {
            return Inertia::location('/students/feed');
        }
        return Inertia::location('/admin/dashboard');

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
