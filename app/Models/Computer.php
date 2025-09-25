<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Computer extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'CpuGpu',
        'computer_state',
        'is_available',
        'user_id',
        'start_date',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'start_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}


