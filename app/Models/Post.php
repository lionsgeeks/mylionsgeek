<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public const MAX_IMAGES = 16;

    protected $fillable = [
        'user_id',
        'repost_of_post_id',
        'description',
        'images',
        'hashTags',
        'status',
    ];
    protected $casts = [
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function repostOf()
    {
        return $this->belongsTo(self::class, 'repost_of_post_id');
    }

    public function reposts()
    {
        return $this->hasMany(self::class, 'repost_of_post_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
