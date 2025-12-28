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
        return self::create([
            'user_id' => $userId,
            'follower_id' => $followerId,
        ]);
    }
}
