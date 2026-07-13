<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\UserWelcomeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function inviteStudent(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'max:15'],
            'image' => ['nullable'],
        ]);

        $existing = User::query()->where('email', $data['email'])->first();
        if ($existing) {
            return response()->json([
                'status' => 'exists',
                'data' => $existing,
            ]);
        }

        $plainPassword = Str::random(12);
        $token = (string) Str::uuid();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'activation_token' => $token,
            'password' => Hash::make($plainPassword),
            'phone' => $data['phone'],
            'image' => $data['image'] ?: 'pdp.png',
            'status' => 'Studying',
            'cin' => null,
            'formation_id' => null,
            'account_state' => 0,
            'access_studio' => 1,
            'access_cowork' => 1,
            'role' => ['student'],
            'remember_token' => null,
            'email_verified_at' => null,
        ]);

        $link = URL::temporarySignedRoute(
            'user.complete-profile',
            now()->addHours(24),
            ['token' => $token]
        );

        Mail::to($user->email)->send(new UserWelcomeMail($user, $link));

        return response()->json([
            'status' => 'created',
            'data' => $user,
        ]);
    }
}
