<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostNotification extends Model
{
    public const TYPE_LIKE = 'like';
    public const TYPE_COMMENT = 'comment';
    public const TYPE_COMMENT_LIKE = 'comment_like';
    public const TYPE_MENTION = 'mention';
    public const TYPE_REPOST = 'repost';
    public const TYPE_SHARE = 'share';
    public const TYPE_REPOST_LIKE = 'repost_like';
    public const TYPE_REPOST_COMMENT = 'repost_comment';

    protected $fillable = [
        'user_id',           // Post owner who receives notification
        'sender_id',         // User who liked/commented
        'post_id',           // The post that was interacted with
        'type',              // 'like', 'comment', or 'comment_like'
        'read_at',           // When notification was read
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Create a notification for post interaction
     */
    public static function createNotification($userId, $senderId, $postId, $type)
    {
        // Don't create notification if user is interacting with their own content
        if ($userId == $senderId) {
            return null;
        }

        // Validate notification type
        if (!in_array($type, [
            self::TYPE_LIKE,
            self::TYPE_COMMENT,
            self::TYPE_COMMENT_LIKE,
            self::TYPE_MENTION,
            self::TYPE_REPOST,
            self::TYPE_SHARE,
            self::TYPE_REPOST_LIKE,
            self::TYPE_REPOST_COMMENT,
        ], true)) {
            return null;
        }

        $notification = static::create([
            'user_id' => $userId,
            'sender_id' => $senderId,
            'post_id' => $postId,
            'type' => $type,
        ]);

        // Send Expo push notification
        if ($notification) {
            try {
                // Refresh user from database to ensure we have latest expo_push_token
                $user = \App\Models\User::find($userId);
                $sender = \App\Models\User::find($senderId);
                
                if ($user && $sender) {
                    // Refresh user to get latest expo_push_token
                    $user->refresh();
                    
                    if ($user->expo_push_token) {
                        $pushService = app(\App\Services\ExpoPushNotificationService::class);
                        
                        // Create notification message based on type
                        $title = 'New Post Interaction';
                        $message = '';
                        
                        switch ($type) {
                            case self::TYPE_LIKE:
                                $message = "{$sender->name} liked your post";
                                break;
                            case self::TYPE_COMMENT:
                                $message = "{$sender->name} commented on your post";
                                break;
                            case self::TYPE_COMMENT_LIKE:
                                $message = "{$sender->name} liked your comment";
                                break;
                            case self::TYPE_MENTION:
                                $message = "{$sender->name} mentioned you in a post";
                                break;
                            case self::TYPE_REPOST:
                                $message = "{$sender->name} reposted your post";
                                break;
                            case self::TYPE_SHARE:
                                $message = "{$sender->name} shared a post with you";
                                break;
                            case self::TYPE_REPOST_LIKE:
                                $message = "{$sender->name} liked the post you reposted";
                                break;
                            case self::TYPE_REPOST_COMMENT:
                                $message = "{$sender->name} commented on the post you reposted";
                                break;
                        }
                        
                        \Illuminate\Support\Facades\Log::info('Sending push notification for post interaction', [
                            'user_id' => $userId,
                            'type' => $type,
                            'has_token' => !empty($user->expo_push_token),
                        ]);
                        
                        $success = $pushService->sendToUser($user, $title, $message, [
                            'type' => 'post_interaction',
                            'notification_id' => $notification->id,
                            'post_id' => $postId,
                            'sender_id' => $senderId,
                            'sender_name' => $sender->name,
                            'interaction_type' => $type,
                        ]);
                        
                        if (!$success) {
                            \Illuminate\Support\Facades\Log::warning('Push notification send returned false', [
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
                \Illuminate\Support\Facades\Log::error('Failed to send Expo push notification for post interaction', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'notification_id' => $notification->id ?? null,
                    'user_id' => $userId,
                ]);
                // Don't fail notification creation if push fails
            }
        }

        return $notification;
    }
}
