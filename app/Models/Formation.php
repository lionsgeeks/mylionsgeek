<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Formation extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid();
            }
        });
    }

    protected $fillable = [
        'name',
        'img',
        'category',
        'start_time',
        'end_time',
        'promo',
        'user_id',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'formation_id');
    }

    public function coach()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get Geekos for this formation.
     */
    public function geekos()
    {
        return $this->hasMany(Geeko::class, 'formation_id');
    }
}
