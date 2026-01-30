<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowNotification extends Model
{
    protected $fillable = [
        'user_id',           // User who is being followed (receives notification)
        'follower_id',       // User who followed (sender)
        'read_at',           // When notification was read
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public static function createNotification($userId, $followerId)
    {
        $notification = self::create([
            'user_id' => $userId,
            'follower_id' => $followerId,
        ]);

        // Send Expo push notification
        if ($notification) {
            try {
                $user = \App\Models\User::find($userId);
                $follower = \App\Models\User::find($followerId);
                
                if ($user && $follower) {
                    // Refresh user to get latest expo_push_token
                    $user->refresh();
                    
                    if ($user->expo_push_token) {
                        $pushService = app(\App\Services\ExpoPushNotificationService::class);
                        
                        \Illuminate\Support\Facades\Log::info('Sending push notification for follow', [
                            'user_id' => $userId,
                            'follower_id' => $followerId,
                        ]);
                        
                        $success = $pushService->sendToUser($user, 'New Follower', "{$follower->name} started following you", [
                            'type' => 'follow',
                            'notification_id' => $notification->id,
                            'follower_id' => $followerId,
                            'follower_name' => $follower->name,
                        ]);
                        
                        if (!$success) {
                            \Illuminate\Support\Facades\Log::warning('Push notification send returned false for follow', [
                                'user_id' => $userId,
                                'notification_id' => $notification->id,
                            ]);
                        }
                    } else {
                        \Illuminate\Support\Facades\Log::info('User does not have Expo push token, skipping push notification', [
                            'user_id' => $userId,
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send Expo push notification for follow', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'notification_id' => $notification->id ?? null,
                ]);
                // Don't fail notification creation if push fails
            }
        }

        return $notification;
    }
}
