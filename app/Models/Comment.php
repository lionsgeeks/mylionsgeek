<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    //
    protected $fillable = [
        'user_id',
        'post_id',
        'comment',
        'image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(CommentLike::class);
    }
}
