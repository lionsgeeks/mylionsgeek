<?php

namespace App\Services;

use Ably\AblyRest;
use App\Models\Call;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CallService
{
    public function __construct(
        protected AgoraTokenService $agoraTokenService,
        protected ExpoPushNotificationService $expoPush
    ) {
    }

    /**
     * Publish event to a user's call Ably channel.
     */
    private function publishToUserChannel(int $userId, string $eventName, array $payload): void
    {
        try {
            $ablyKey = config('services.ably.key');
            if (!$ablyKey) {
                Log::warning('Ably not configured, skipping call broadcast');
                return;
            }
            $ably = new AblyRest($ablyKey);
            $channel = $ably->channels->get('call:user:' . $userId);
            $channel->publish($eventName, $payload);
        } catch (\Throwable $e) {
            Log::error('CallService Ably publish failed: ' . $e->getMessage());
        }
    }

    /**
     * Initiate a call from caller to callee.
     * Creates Call record, generates channel + token, broadcasts incoming-call to callee, optional Expo push.
     *
     * @return array{call: Call, channel_name: string, token: string}
     */
    public function initiate(User $caller, int $calleeId): array
    {
        if ($caller->id === $calleeId) {
            throw new \InvalidArgumentException('Cannot call yourself.');
        }

        $callee = User::find($calleeId);
        if (!$callee) {
            throw new \InvalidArgumentException('Callee not found.');
        }

        $channelName = 'call_' . uniqid('', true);

        $call = Call::create([
            'caller_id' => $caller->id,
            'callee_id' => $callee->id,
            'channel_name' => $channelName,
            'status' => Call::STATUS_PENDING,
        ]);

        $callerToken = $this->agoraTokenService->generateRtcToken($channelName, $caller->id);
        if (!$callerToken) {
            $call->delete();
            throw new \RuntimeException('Failed to generate Agora token.');
        }

        $payload = [
            'call_id' => $call->id,
            'channel_name' => $channelName,
            'caller' => [
                'id' => $caller->id,
                'name' => $caller->name,
                'avatar' => $caller->image ?? null,
            ],
            'caller_token' => $callerToken,
        ];

        $this->publishToUserChannel($callee->id, 'incoming-call', $payload);

        // Optional: Expo push for when app is in background
        $this->expoPush->sendToUser(
            $callee,
            'Incoming call',
            $caller->name . ' is calling you.',
            [
                'type' => 'incoming_call',
                'call_id' => $call->id,
                'channel_name' => $channelName,
                'caller_id' => $caller->id,
                'caller_name' => $caller->name,
            ]
        );

        return [
            'call' => $call,
            'channel_name' => $channelName,
            'token' => $callerToken,
        ];
    }

    /**
     * Callee accepts the call. Updates status to ongoing, broadcasts call-accepted to caller.
     *
     * @return array{call: Call, channel_name: string, token: string}
     */
    public function accept(int $callId, User $acceptor): array
    {
        $call = Call::findOrFail($callId);
        if ($call->callee_id !== $acceptor->id) {
            throw new \InvalidArgumentException('Only the callee can accept this call.');
        }
        if ($call->status !== Call::STATUS_PENDING) {
            throw new \InvalidArgumentException('Call is no longer pending.');
        }

        $call->update([
            'status' => Call::STATUS_ONGOING,
            'started_at' => now(),
        ]);
        $call->load(['caller', 'callee']);

        $calleeToken = $this->agoraTokenService->generateRtcToken($call->channel_name, $call->callee_id);
        if (!$calleeToken) {
            throw new \RuntimeException('Failed to generate Agora token.');
        }

        $this->publishToUserChannel($call->caller_id, 'call-accepted', [
            'call_id' => $call->id,
            'channel_name' => $call->channel_name,
        ]);

        return [
            'call' => $call,
            'channel_name' => $call->channel_name,
            'token' => $calleeToken,
        ];
    }

    /**
     * Callee rejects the call. Broadcasts call-rejected to caller.
     */
    public function reject(int $callId, User $rejector): void
    {
        $call = Call::findOrFail($callId);
        if ($call->callee_id !== $rejector->id) {
            throw new \InvalidArgumentException('Only the callee can reject this call.');
        }
        if ($call->status !== Call::STATUS_PENDING) {
            throw new \InvalidArgumentException('Call is no longer pending.');
        }

        $call->update(['status' => Call::STATUS_ENDED]);

        $this->publishToUserChannel($call->caller_id, 'call-rejected', [
            'call_id' => $call->id,
        ]);
    }

    /**
     * End an ongoing call. Either party can end. Broadcasts call-ended to the other user.
     */
    public function end(int $callId, User $user): void
    {
        $call = Call::findOrFail($callId);
        $isCaller = $call->caller_id === $user->id;
        $isCallee = $call->callee_id === $user->id;
        if (!$isCaller && !$isCallee) {
            throw new \InvalidArgumentException('You are not a participant of this call.');
        }
        if ($call->status !== Call::STATUS_ONGOING && $call->status !== Call::STATUS_PENDING) {
            throw new \InvalidArgumentException('Call is not active.');
        }

        $call->update([
            'status' => Call::STATUS_ENDED,
            'ended_at' => now(),
        ]);

        $otherUserId = $isCaller ? $call->callee_id : $call->caller_id;
        $this->publishToUserChannel($otherUserId, 'call-ended', [
            'call_id' => $call->id,
        ]);
    }

    /**
     * Get call history for the authenticated user (recent calls).
     */
    public function history(User $user, int $perPage = 20)
    {
        return Call::where('caller_id', $user->id)
            ->orWhere('callee_id', $user->id)
            ->with(['caller:id,name,image', 'callee:id,name,image'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
