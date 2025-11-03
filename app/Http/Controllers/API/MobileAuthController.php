<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request)
    {
        
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($user->account_state) {
            return response()->json([
                'message' => 'Account disabled',
            ], 403);
        }

        // Issue Sanctum token
        $token = $user->createToken('mobile')->plainTextToken;

        $user->forceFill(['last_online' => now()])->save();

        // Handle roles - ensure it's always an array
        $roles = [];
        if (isset($user->role)) {
            $roles = is_array($user->role) ? $user->role : (is_string($user->role) ? json_decode($user->role, true) ?? [$user->role] : [$user->role]);
        }
        if (empty($roles) && isset($user->roles)) {
            $roles = is_array($user->roles) ? $user->roles : (is_string($user->roles) ? json_decode($user->roles, true) ?? [] : []);
        }

        // Return full user data except sensitive fields (password, tokens)
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? null,
            'cin' => $user->cin ?? null,
            'avatar' => $user->image ,
            'image' => $user->image ?? null, // Keep raw image path for reference
            'roles' => $roles, // Always array
            'role' => $roles, // Alias for compatibility
            'promo' => $user->promo ?? null,
            'status' => $user->status ?? null,
            'formation_id' => $user->formation_id ?? null,
            'account_state' => $user->account_state ?? 0,
            'state' => $user->account_state ?? 0, // Alias for compatibility
            'access_cowork' => $user->access_cowork ?? 0,
            'access_studio' => $user->access_studio ?? 0,
            'wakatime_api_key' => $user->wakatime_api_key ? substr($user->wakatime_api_key, 0, 10) . '...' : null, // Partially hidden for security
            'last_online' => $user->last_online ? (is_string($user->last_online) ? $user->last_online : $user->last_online->format('Y-m-d H:i:s')) : null,
            'created_at' => $user->created_at ? (is_string($user->created_at) ? $user->created_at : $user->created_at->toDateTimeString()) : null,
            'updated_at' => $user->updated_at ? (is_string($user->updated_at) ? $user->updated_at : $user->updated_at->toDateTimeString()) : null,
            // Excluded: password, remember_token, activation_token, email_verified_at
        ];

        return response()->json([
            'token' => $token,
            'user' => $userData,
        ]);
    }

    public function forgot(Request $request)
    {
        
        $request->validate(['email' => ['required', 'email']]);
        $status = Password::sendResetLink($request->only('email'));
        
        
        return response()->json([
            'status' => __($status),
            'ok' => $status === Password::RESET_LINK_SENT,
        ]);
    }
}



