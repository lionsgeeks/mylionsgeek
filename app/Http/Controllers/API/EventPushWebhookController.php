<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ExpoPushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EventPushWebhookController extends Controller
{
    /**
     * Receive a public-event-created webhook from lionsgeek.ma and broadcast mobile push.
     */
    public function eventCreated(Request $request, ExpoPushNotificationService $expoPush): JsonResponse
    {
        if (!$this->checkSharedToken($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'event_id' => 'required|integer|min:1',
            'title' => 'required|string|max:100',
            'body' => 'nullable|string|max:500',
        ]);

        $body = $validated['body'] ?? 'A new public event is available. Tap to register.';

        try {
            $delivered = $expoPush->sendEventPush(
                $validated['title'],
                $body,
                $validated['event_id']
            );

            return response()->json([
                'success' => true,
                'delivered' => $delivered,
            ]);
        } catch (\Throwable $e) {
            Log::error('Event push webhook failed', [
                'event_id' => $validated['event_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Event push delivery failed',
            ], 500);
        }
    }

    private function checkSharedToken(Request $request): bool
    {
        $storedToken = config('services.lionsgeek.key');
        $token = $request->bearerToken();

        return $token && $storedToken && hash_equals($storedToken, $token);
    }
}
