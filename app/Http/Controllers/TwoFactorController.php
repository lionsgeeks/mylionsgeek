<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TwoFactorController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct(Google2FA $google2fa)
    {
        $this->google2fa = $google2fa;
    }

    /**
     * Enable two-factor authentication for the user.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is already enabled.'], 400);
        }

        $user->forceFill([
            'two_factor_secret' => encrypt($this->google2fa->generateSecretKey()),
            'two_factor_recovery_codes' => encrypt(json_encode(Collection::times(8, function () {
                return Str::random(10);
            })->all())),
        ])->save();

        return response()->json([
            'message' => 'Two-factor authentication has been enabled.',
            'recovery_codes' => json_decode(decrypt($user->fresh()->two_factor_recovery_codes)),
        ]);
    }

    /**
     * Disable two-factor authentication for the user.
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json(['message' => 'Two-factor authentication has been disabled.']);
    }

    /**
     * Get the QR code for the user's two-factor authentication.
     */
    public function showQrCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $secretKey = decrypt($user->two_factor_secret);
        $companyName = config('app.name', 'Laravel');
        $companyEmail = $user->email;

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            $companyName,
            $companyEmail,
            $secretKey
        );

        // Generate QR code as SVG string
        $qrCodeSvg = QrCode::size(200)->format('svg')->generate($qrCodeUrl);
        
        // Convert to string - the generate method returns an object that can be cast to string
        $qrCodeSvg = (string) $qrCodeSvg;

        return response()->json([
            'svg' => $qrCodeSvg,
            'secret' => $secretKey,
        ]);
    }

    /**
     * Get the user's recovery codes.
     */
    public function showRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        return response()->json([
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes)),
        ]);
    }

    /**
     * Regenerate the user's recovery codes.
     */
    public function storeRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $user->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode(Collection::times(8, function () {
                return Str::random(10);
            })->all())),
        ])->save();

        return response()->json([
            'message' => 'Recovery codes have been regenerated.',
            'recovery_codes' => json_decode(decrypt($user->fresh()->two_factor_recovery_codes)),
        ]);
    }

    /**
     * Confirm two-factor authentication setup.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $secretKey = decrypt($user->two_factor_secret);
        $valid = $this->google2fa->verifyKey($secretKey, $request->code);

        if (!$valid) {
            return response()->json(['message' => 'Invalid authentication code.'], 400);
        }

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        return response()->json(['message' => 'Two-factor authentication has been confirmed.']);
    }

    /**
     * Verify a two-factor authentication code.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->hasTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $secretKey = decrypt($user->two_factor_secret);
        $valid = $this->google2fa->verifyKey($secretKey, $request->code);

        if (!$valid) {
            return response()->json(['message' => 'Invalid authentication code.'], 400);
        }

        return response()->json(['message' => 'Authentication code is valid.']);
    }
}
