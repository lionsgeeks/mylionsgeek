<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Call extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_ENDED = 'ended';
    public const STATUS_MISSED = 'missed';

    protected $fillable = [
        'caller_id',
        'callee_id',
        'channel_name',
        'status',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    /**
     * User who initiated the call.
     */
    public function caller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    /**
     * User who receives the call.
     */
    public function callee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'callee_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', self::STATUS_ONGOING);
    }

    public function scopeEnded($query)
    {
        return $query->where('status', self::STATUS_ENDED);
    }

    public function scopeMissed($query)
    {
        return $query->where('status', self::STATUS_MISSED);
    }
}
