<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Badges extends Model
{
    protected $fillable = [
        'badge_name',
        'user_id',
        'model_id',
        'exp',
    ];

    /**
     * Get the user that owns this badge.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the model associated with this badge.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(Models::class, 'model_id');
    }
}
