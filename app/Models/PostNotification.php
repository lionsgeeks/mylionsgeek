<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostNotification extends Model
{
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
        if (!in_array($type, ['like', 'comment', 'comment_like'])) {
            return null;
        }

        return static::create([
            'user_id' => $userId,
            'sender_id' => $senderId,
            'post_id' => $postId,
            'type' => $type,
        ]);
    }
}
