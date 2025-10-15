<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompleteProfileController extends Controller
{
    public function goToCompleteProfile(Request $request, $token)
    {
        // ✅ Manually check if the URL is still valid (not expired or tampered)
        if (! $request->hasValidSignature()) {
            return Inertia::render('profile/ExpiredLink');
        }

        // ✅ Then try to get the user using the token
        $user = User::where('activation_token', $token)->first();

        if (!$user) {
            return Inertia::render('profile/ExpiredLink');
        }

        // ✅ (Optional) Prevent already-completed users from re-using the link
        // if ($user->account_state === 'active') {
        //     return redirect('/login')->with('error', 'Profile already completed.');
        // }

        return Inertia::render('profile/index', [
            'user' => $user,
        ]);
    }
}
