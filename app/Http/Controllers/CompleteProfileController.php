<?php

namespace App\Http\Controllers;

use App\Mail\UserWelcomeMail;
use App\Mail\WelcomeUserAfterProfileComplete;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CompleteProfileController extends Controller
{
    public function goToCompleteProfile(Request $request, $token)
    {
        // ✅ Manually check if the URL is still valid (not expired or tampered)
        if (! $request->hasValidSignature()) {
            return Inertia::render('profile/ExpiredLink');
        }
        // dd():

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
    public function resendActivationLink($id)
    {
        // Regenerate a new activation token (optional but safer)
        $user = User::find($id);
        // dd($id);
        $user->activation_token = Str::uuid();
        $user->save();

        // Create new signed link valid for 24 hours
        $link = URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHours(24),
            ['token' => $user->activation_token]
        );

        // Send email
        Mail::to($user->email)->send(new UserWelcomeMail($user, $link));

        return redirect()->back()->with('success', 'Activation link resent successfully.');
    }
    // public function submitCompleteProfile(Request $request, $token)
    // {
    //     // No need to check signed URL here
    //     dd($token);

    //     $user = User::where('activation_token', $token)->first();

    //     if (!$user) {
    //         return Inertia::render('profile/ExpiredLink');
    //     }

    //     return redirect('/login')->with('success', 'Profile completed!');
    // }

    public function submitCompleteProfile(Request $request, $token)
    {
        $user = User::where('activation_token', $token)->first();

        if (!$user) {
            return Inertia::render('profile/ExpiredLink');
        }

        // dd($request->all());
        // ✅ Validate incoming request
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:15',
            'cin' => 'required|string|max:10|unique:users,cin,' . $user->id,
            'entreprise' => 'required|string|max:255',
            'status' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // max 2MB
        ]);
        // dd($validated);

        // ✅ Handle image upload (optional)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $user->image = $path;
        }

        // ✅ Update user fields
        $user->password = Hash::make($validated['password']);
        $user->phone = $validated['phone'];
        $user->cin = $validated['cin'];
        $user->entreprise = $validated['entreprise'];
        $user->activation_token = null; // Invalidate the token
        $user->account_state = 0; // Optional: mark user as active
        $user->save();
        
        Mail::to($user->email)->send(new WelcomeUserAfterProfileComplete($user));


        return redirect('/login')->with('success', 'Profile completed successfully. You can now log in.');
    }
}
