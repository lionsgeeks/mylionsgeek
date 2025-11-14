<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    //
    protected $fillable = [
        'follower_id',
        'followed_id'
    ];

    public function followers(){
        $this->belongsToMany(User::class , 'follows' , 'follower_id' , 'followed_id');
    }
    public function following(){
        $this->belongsToMany(User::class , 'follows' , 'follower_id' , 'followed_id');
    }
}
