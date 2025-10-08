<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Geeko extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'formation_id',
        'created_by',
        'cover_image',
        'time_limit',
        'show_correct_answers',
        'status',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'show_correct_answers' => 'boolean',
    ];

    /**
     * Get the formation that owns this Geeko.
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    /**
     * Get the user who created this Geeko.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the questions for this Geeko.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(GeekoQuestion::class)->orderBy('order_index');
    }

    /**
     * Get the sessions for this Geeko.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(GeekoSession::class);
    }

    /**
     * Get the active session for this Geeko.
     */
    public function activeSession()
    {
        return $this->sessions()->whereIn('status', ['waiting', 'in_progress'])->first();
    }

    /**
     * Check if Geeko is ready to be played.
     */
    public function isReady(): bool
    {
        return $this->status === 'ready' && $this->questions()->count() > 0;
    }
}