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
            'phone' => ['nullable', 'string', 'max:30'],
            'image' => ['nullable'],
            'is_children' => ['nullable', 'boolean'],
        ]);

        $inviteSource = $request->boolean('is_children')
            ? 'lionsgeek_children'
            : 'lionsgeek_adult';

        $existing = User::query()->where('email', $data['email'])->first();
        if ($existing) {
            $existing->fill([
                'name' => $data['name'],
                'phone' => $data['phone'] ?: $existing->phone,
                'image' => $data['image'] ?: $existing->image,
                'invite_source' => $inviteSource,
                'activation_token' => (string) Str::uuid(),
            ]);
            $existing->save();

            $link = URL::temporarySignedRoute(
                'user.complete-profile',
                now()->addHours(24),
                ['token' => $existing->activation_token]
            );
            Mail::to($existing->email)->send(new UserWelcomeMail($existing, $link));

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
            'phone' => $data['phone'] ?: null,
            'image' => $data['image'] ?: 'pdp.png',
            'status' => 'Studying',
            'cin' => null,
            'formation_id' => null,
            'account_state' => 0,
            'access_studio' => 1,
            'access_cowork' => 1,
            'role' => ['student'],
            'invite_source' => $inviteSource,
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
