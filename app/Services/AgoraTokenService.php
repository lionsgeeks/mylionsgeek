<?php

namespace App\Services;

use App\Models\Call;
use Illuminate\Support\Facades\Log;
use Peterujah\Agora\Agora;
use Peterujah\Agora\Builders\RtcToken;
use Peterujah\Agora\Roles;
use Peterujah\Agora\User;

class AgoraTokenService
{
    /**
     * Generate RTC token for a user to join an Agora voice channel.
     *
     * @param string $channelName Agora channel name
     * @param int|string $userId User ID (used as Agora uid / userAccount)
     * @param int $expirySeconds Token validity in seconds (default 1 hour)
     * @return string|null RTC token or null on failure
     */
    public function generateRtcToken(string $channelName, $userId, int $expirySeconds = 3600): ?string
    {
        $appId = trim((string) config('services.agora.app_id'));
        $certificate = trim((string) config('services.agora.app_certificate'));

        if ($appId === '' || $certificate === '') {
            Log::warning('Agora credentials not configured');
            return null;
        }

        try {
            $currentTimestamp = (new \DateTime('now', new \DateTimeZone('UTC')))->getTimestamp();
            $privilegeExpiredTs = $currentTimestamp + $expirySeconds;

            $client = new Agora($appId, $certificate);
            $client->setExpiration($privilegeExpiredTs);

            // Use string user account so any user id works (Agora supports string uid)
            $userAccount = (string) $userId;
            $user = (new User($userAccount))
                ->setPrivilegeExpire($privilegeExpiredTs)
                ->setChannel($channelName)
                ->setRole(Roles::RTC_PUBLISHER);

            return RtcToken::buildTokenWithUserAccount($client, $user);
        } catch (\Throwable $e) {
            Log::error('Agora token generation failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return null;
        }
    }

    /**
     * Generate tokens for both caller and callee for a call.
     *
     * @return array{caller_token: string|null, callee_token: string|null}
     */
    public function generateTokensForCall(Call $call): array
    {
        $channelName = $call->channel_name;
        return [
            'caller_token' => $this->generateRtcToken($channelName, $call->caller_id),
            'callee_token' => $this->generateRtcToken($channelName, $call->callee_id),
        ];
    }
}
