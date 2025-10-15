<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompleteProfileController extends Controller
{
    public function goToCompleteProfile(Request $request, $token)
    {
        $user = User::where('activation_token', $token)->first();

        if (!$user) {
            abort(404, "Invalid or expired activation link.");
        }

        // Optionally, check if profile is already completed or user is active to prevent reuse

        return Inertia::render('profile/index', [
            'user' => $user,
        ]);
    }
}
