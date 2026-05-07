<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    public const MAX_IMAGES = 16;

    protected $fillable = [
        'user_id',
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

    public function reposts()
    {
        // Pivot-based reposts: users who reposted this post.
        return $this->belongsToMany(User::class, 'reposts_posts', 'post_id', 'user_id')
            ->withPivot(['description'])
            ->withTimestamps();
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'post_saves', 'post_id', 'user_id')->withTimestamps();
    }
}
