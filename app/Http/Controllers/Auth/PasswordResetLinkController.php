<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', __('A password reset link has been sent to your email.'));
        }

        if ($status === Password::INVALID_USER) {
            return back()->withErrors([
                'email' => __('This account does not exist.'),
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            return back()->withErrors([
                'email' => __('Please wait before retrying.'),
            ]);
        }

        return back()->withErrors([
            'email' => __('Unable to send a password reset link.'),
        ]);
    }
}
