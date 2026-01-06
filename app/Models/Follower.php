<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    protected $table = 'followers';

    protected $fillable = [
        'follower_id',
        'followed_id',
    ];

    public $timestamps = true;
}

