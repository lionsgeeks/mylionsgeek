<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',               // UUID primary key
        'name',
        'email',
        'password',
        'phone',
        'cin',
        'status',
        'formation_id',
        'email_verified_at',
        'account_state',
        // 'remember_token',
        // 'created_at',
        // 'updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    
    public function access(): HasOne
    {
        return $this->hasOne(Access::class);
    }
    public function formation()
    {
        return $this->hasOne(Formation::class);
    }
    public function scopeActive($query)
    {
        return $query->where('account_state', 0);
    }
}
