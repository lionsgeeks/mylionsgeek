<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;

class ExpoPushNotificationService
{
    /**
     * Expo Push Notification API endpoint
     */
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a push notification to a user
     * 
     * @param User $user The user to send the notification to
     * @param string $title Notification title
     * @param string $body Notification body/message
     * @param array $data Additional data payload (optional)
     * @return bool Success status
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): bool
    {
        // Refresh user to ensure we have latest expo_push_token
        $user->refresh();
        
        // Check if user has an Expo push token
        if (!$user->expo_push_token) {
            Log::info('User does not have Expo push token', [
                'user_id' => $user->id,
                'user_email' => $user->email,
            ]);
            return false;
        }

        Log::info('Sending push notification to user', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'token_preview' => substr($user->expo_push_token, 0, 30) . '...',
            'title' => $title,
            'body' => $body,
        ]);

        return $this->send($user->expo_push_token, $title, $body, $data);
    }

    /**
     * Send push notification to multiple tokens
     * 
     * @param array|string $tokens Single token or array of tokens
     * @param string $title Notification title
     * @param string $body Notification body/message
     * @param array $data Additional data payload (optional)
     * @return bool Success status
     */
    public function send($tokens, string $title, string $body, array $data = []): bool
    {
        // Normalize tokens to array
        $tokenArray = is_array($tokens) ? $tokens : [$tokens];
        
        // Filter out empty tokens
        $tokenArray = array_filter($tokenArray, function($token) {
            return !empty($token) && is_string($token);
        });

        if (empty($tokenArray)) {
            Log::warning('No valid Expo push tokens provided');
            return false;
        }

        // Validate token format (should be ExponentPushToken[...])
        foreach ($tokenArray as $index => $token) {
            if (!preg_match('/^ExponentPushToken\[.+\]$/', $token)) {
                Log::warning('Invalid Expo push token format', [
                    'token_preview' => substr($token, 0, 50) . '...',
                    'expected_format' => 'ExponentPushToken[...]',
                    'token_length' => strlen($token),
                ]);
                // Don't fail, just log - Expo API will handle invalid tokens
            }
        }

        // Prepare messages for Expo API
        $messages = [];
        foreach ($tokenArray as $token) {
            $messages[] = [
                'to' => $token,
                'sound' => 'default',
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'priority' => 'high',
                'channelId' => 'default',
            ];
        }
        
        Log::info('Prepared messages for Expo API', [
            'message_count' => count($messages),
            'first_token_preview' => substr($tokenArray[0] ?? '', 0, 50) . '...',
        ]);

        try {
            Log::info('Sending Expo push notification', [
                'token_count' => count($messages),
                'titles' => array_column($messages, 'title'),
            ]);

            // Expo API expects the request body to be a JSON array directly: [{"to": "...", ...}]
            // NOT an object with "messages" property: {"messages": [{"to": "...", ...}]}
            // Use Guzzle directly to send raw JSON array (Laravel's Http wraps arrays in objects)
            $client = new Client(['timeout' => 10]);
            $guzzleResponse = $client->post(self::EXPO_PUSH_URL, [
                'headers' => [
                    'Accept' => 'application/json',
                    'Accept-Encoding' => 'gzip, deflate',
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode($messages),
            ]);
            
            $statusCode = $guzzleResponse->getStatusCode();
            $responseBody = $guzzleResponse->getBody()->getContents();
            $responseData = json_decode($responseBody, true);
            
            Log::info('Expo API response received', [
                'status' => $statusCode,
                'successful' => $statusCode >= 200 && $statusCode < 300,
                'body_preview' => substr($responseBody, 0, 500),
            ]);

            if ($statusCode >= 200 && $statusCode < 300) {
                if ($responseData === null) {
                    Log::error('Failed to parse Expo API response as JSON', [
                        'body' => $responseBody,
                    ]);
                    return false;
                }
                
                Log::info('Expo API response data', [
                    'response' => $responseData,
                ]);
                
                // Check for errors in response
                if (isset($responseData['data'])) {
                    $data = $responseData['data'];
                    
                    // Expo API can return data as either an array (multiple messages) or object (single message)
                    // Normalize to array for processing
                    if (!is_array($data)) {
                        $data = [$data];
                    }
                    
                    $hasErrors = false;
                    $errorMessages = [];
                    
                    foreach ($data as $result) {
                        // Handle both array and object formats
                        $status = is_array($result) ? ($result['status'] ?? null) : ($result->status ?? null);
                        
                        if ($status === 'error') {
                            $hasErrors = true;
                            $errorMsg = is_array($result) ? ($result['message'] ?? 'Unknown error') : ($result->message ?? 'Unknown error');
                            $errorCode = null;
                            
                            // Handle error details - can be object or array
                            $details = is_array($result) ? ($result['details'] ?? null) : ($result->details ?? null);
                            if ($details) {
                                if (is_object($details)) {
                                    $errorCode = $details->error ?? null;
                                } elseif (is_array($details)) {
                                    $errorCode = $details['error'] ?? null;
                                }
                            }
                            
                            $token = is_array($result) ? ($result['to'] ?? '') : ($result->to ?? '');
                            
                            $errorMessages[] = [
                                'message' => $errorMsg,
                                'error_code' => $errorCode,
                                'token_preview' => substr($token, 0, 30) . '...',
                            ];
                            
                            Log::warning('Expo push notification error', [
                                'error' => $errorMsg,
                                'error_code' => $errorCode,
                                'token_preview' => substr($token, 0, 30) . '...',
                                'full_result' => $result,
                            ]);
                        } else {
                            // Success case
                            $id = is_array($result) ? ($result['id'] ?? null) : ($result->id ?? null);
                            $statusValue = $status ?? 'unknown';
                            
                            Log::info('Expo push notification success', [
                                'status' => $statusValue,
                                'id' => $id,
                            ]);
                        }
                    }
                    
                    if (!$hasErrors) {
                        Log::info('Expo push notifications sent successfully', [
                            'count' => count($messages),
                        ]);
                        return true;
                    } else {
                        Log::warning('Some Expo push notifications had errors', [
                            'count' => count($messages),
                            'errors' => $errorMessages,
                        ]);
                        return false;
                    }
                }
                
                // If no data field, check if response indicates success
                if (isset($responseData['errors']) && !empty($responseData['errors'])) {
                    Log::error('Expo API returned errors', [
                        'errors' => $responseData['errors'],
                        'full_response' => $responseData,
                    ]);
                    return false;
                }
                
                Log::info('Expo push notification response (no data field)', [
                    'response' => $responseData,
                ]);
                return true;
            } else {
                Log::error('Failed to send Expo push notification', [
                    'status' => $statusCode,
                    'body' => $responseBody,
                    'json' => $responseData,
                ]);
                
                // Return false but log detailed error
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception while sending Expo push notification', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Send push notification to multiple users
     * 
     * @param array $users Array of User models
     * @param string $title Notification title
     * @param string $body Notification body/message
     * @param array $data Additional data payload (optional)
     * @return int Number of successful sends
     */
    public function sendToUsers(array $users, string $title, string $body, array $data = []): int
    {
        $successCount = 0;
        
        foreach ($users as $user) {
            if ($this->sendToUser($user, $title, $body, $data)) {
                $successCount++;
            }
        }
        
        return $successCount;
    }
}
