<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ExpoPushNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestPushController extends Controller
{
    /**
     * Test endpoint to send a push notification to the authenticated user
     * Useful for debugging and testing push notifications
     */
    public function test(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Refresh user to get latest expo_push_token
        $user->refresh();

        // Check if user has push token
        if (!$user->expo_push_token) {
            return response()->json([
                'success' => false,
                'message' => 'User does not have an Expo push token registered',
                'user_id' => $user->id,
                'user_email' => $user->email,
                'hint' => 'Make sure you have logged in from the mobile app and granted notification permissions',
            ], 400);
        }

        $title = $request->input('title', '🧪 Test Push Notification');
        $body = $request->input('body', 'This is a test push notification from LionsGeek! If you see this, push notifications are working! 🎉');
        $data = $request->input('data', []);

        Log::info('Test push notification requested', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_token' => !empty($user->expo_push_token),
            'token_preview' => substr($user->expo_push_token, 0, 30) . '...',
            'title' => $title,
            'body' => $body,
        ]);

        try {
            $pushService = app(ExpoPushNotificationService::class);
            
            Log::info('Calling push service sendToUser', [
                'user_id' => $user->id,
            ]);
            
            $success = $pushService->sendToUser($user, $title, $body, array_merge([
                'type' => 'test',
                'timestamp' => now()->toIso8601String(),
                'test' => true,
            ], $data));

            Log::info('Push service returned', [
                'user_id' => $user->id,
                'success' => $success,
            ]);

            // If failed, check recent logs for more details
            if (!$success) {
                $logFile = storage_path('logs/laravel.log');
                $recentErrors = [];
                if (file_exists($logFile)) {
                    $lines = file($logFile);
                    // Get last 100 lines
                    $recentLines = array_slice($lines, -100);
                    foreach (array_reverse($recentLines) as $line) {
                        if (stripos($line, 'Expo') !== false || 
                            stripos($line, 'push notification') !== false ||
                            stripos($line, 'error') !== false) {
                            $recentErrors[] = trim($line);
                            if (count($recentErrors) >= 5) break; // Get last 5 relevant lines
                        }
                    }
                }
                
                Log::warning('Push notification send failed - recent errors', [
                    'user_id' => $user->id,
                    'recent_errors' => $recentErrors,
                ]);
            }

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Test notification sent successfully! Check your phone for the push notification.',
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'token_preview' => substr($user->expo_push_token, 0, 30) . '...',
                    'title' => $title,
                    'body' => $body,
                    'note' => 'If you don\'t see the notification on your phone, check: 1) App is in background/closed, 2) Device notification settings, 3) Laravel logs for errors',
                ]);
            } else {
                // Try to get more details from recent logs
                $logFile = storage_path('logs/laravel.log');
                $recentErrors = [];
                if (file_exists($logFile)) {
                    $lines = file($logFile);
                    // Get last 200 lines
                    $recentLines = array_slice($lines, -200);
                    foreach (array_reverse($recentLines) as $line) {
                        $lineLower = strtolower($line);
                        if (stripos($line, 'Expo') !== false || 
                            stripos($line, 'push notification') !== false ||
                            stripos($line, 'error') !== false ||
                            stripos($line, 'exception') !== false) {
                            $recentErrors[] = trim($line);
                            if (count($recentErrors) >= 10) break;
                        }
                    }
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send notification. The Expo API call returned false.',
                    'user_id' => $user->id,
                    'token_preview' => substr($user->expo_push_token, 0, 30) . '...',
                    'full_token' => $user->expo_push_token, // Include full token for debugging
                    'hint' => 'Check storage/logs/laravel.log for detailed error messages. Look for "Expo push notification error" or "Failed to send Expo push notification"',
                    'recent_log_errors' => array_slice($recentErrors, 0, 5), // Last 5 relevant log lines
                    'debug_info' => [
                        'token_format_valid' => preg_match('/^ExponentPushToken\[.+\]$/', $user->expo_push_token),
                        'token_length' => strlen($user->expo_push_token),
                    ],
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Test push notification failed with exception', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Exception occurred while sending notification',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => $user->id,
                'token_preview' => substr($user->expo_push_token ?? '', 0, 30) . '...',
            ], 500);
        }
    }

    /**
     * Get push token status for the authenticated user
     */
    public function status(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user->refresh();

        return response()->json([
            'has_token' => !empty($user->expo_push_token),
            'token_preview' => $user->expo_push_token ? substr($user->expo_push_token, 0, 30) . '...' : null,
            'full_token' => $user->expo_push_token, // Include full token for debugging
            'user_id' => $user->id,
            'user_email' => $user->email,
        ]);
    }
}
