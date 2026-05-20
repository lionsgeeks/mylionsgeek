<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'media_path',
        'media_type',
        'audience',
        'overlays',
        'duration_ms',
        'width',
        'height',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'duration_ms' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'overlays' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(StoryView::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(StoryReaction::class);
    }

    public function highlightItems(): HasMany
    {
        return $this->hasMany(StoryHighlightItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
