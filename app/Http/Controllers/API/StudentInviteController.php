<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\UserWelcomeMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class StudentInviteController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (! $this->authorized($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'promo' => ['required', 'integer', 'min:1', 'max:100'],
            'field' => ['required', 'string', 'in:coding,media'],
        ]);

        $email = strtolower($data['email']);
        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            if (! $existing->hasPendingActivation()) {
                return response()->json([
                    'status' => 'activated',
                    'mail_sent' => false,
                ]);
            }

            $existing->forceFill([
                'promo' => $data['promo'],
                'field' => $data['field'],
                'invite_source' => 'lionsgeek_adult',
            ])->save();

            return response()->json([
                'status' => 'pending',
                'mail_sent' => $this->queueCompleteProfileEmail($existing),
            ]);
        }

        $user = new User;
        $user->forceFill([
            'name' => $this->nameFromEmail($email),
            'email' => $email,
            'password' => Str::random(32),
            'status' => 'Studying',
            'image' => 'pdp.png',
            'account_state' => 0,
            'access_studio' => 1,
            'access_cowork' => 1,
            'role' => ['student'],
            'promo' => $data['promo'],
            'field' => $data['field'],
            'invite_source' => 'lionsgeek_adult',
        ])->save();

        return response()->json([
            'status' => 'created',
            'mail_sent' => $this->queueCompleteProfileEmail($user),
        ]);
    }

    private function authorized(Request $request): bool
    {
        $stored = (string) config('services.lionsgeek.key');
        $bearer = (string) $request->bearerToken();

        if ($stored === '' || $bearer === '') {
            return false;
        }

        return hash_equals($stored, $bearer);
    }

    private function nameFromEmail(string $email): string
    {
        $local = strstr($email, '@', true);
        $local = is_string($local) ? trim($local) : '';

        return $local !== '' ? mb_substr($local, 0, 255) : 'Student';
    }

    private function queueCompleteProfileEmail(User $user): bool
    {
        try {
            $plainToken = $user->issueActivationToken();
            $link = URL::temporarySignedRoute(
                'user.complete-profile',
                now()->addHours(User::ACTIVATION_TTL_HOURS),
                ['token' => $plainToken]
            );

            Mail::to($user->email)->queue(new UserWelcomeMail($user, $link));

            return true;
        } catch (\Throwable $e) {
            Log::error('Complete profile email failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
