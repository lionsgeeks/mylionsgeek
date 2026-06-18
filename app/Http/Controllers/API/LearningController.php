<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class LearningController extends Controller
{
    public function redirectCode(): RedirectResponse
    {
        $code = $this->getCode();
        return redirect()->guest(env("LEARNING_URL") . "callback/" . $code);
    }



    private function getCode(): string
    {
        $code = Str::random(64);
        Cache::put($code, [
            "user_id" => Auth::user()->id,
            "app_id" => "learning"
        ], now()->addMinutes(10));

        return $code;
    }


    private function getToken(string $code): array
    {
        $token = [];
        $cacheKey = Cache::get($code);
        if (!$cacheKey) {
            return $token;
        }

        
        $user = User::where("id", $cacheKey["user_id"])->first();
        Cache::delete($code);
        if ($user) {
            $token = [  
                "central_id" => $user->id ?? null,
                "name" => $user->name ?? "",
                "email" => $user->email ?? "",
                "avatar" => $user->image ?? "",
                "promo" => $user->promo ?? "",
                "field" => $user->field ?? "",
                "roles"  => $user->role ?? [],
                "status" => $user->status ?? "",
                "formation_id" => $user->formation_id ?? null
            ];
        }

        return $token;
    }

    public function handleToken(Request $request)
    {
        $code = $request->header("code");
        if (!$code) {
            return response()->json([
                'error' => 'invalid_request',
                'message' => 'Authorization code is required'
            ], 400);
        }

        $token = $this->getToken($code);
        if ($token === []) {
            return response()->json([
                'error' => 'invalid_grant',
                'message' => 'Authorization code is invalid or expired'
            ], 401);
        }

        return $token;
    }
}
