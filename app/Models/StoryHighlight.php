<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoryHighlight extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'cover_path'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StoryHighlightItem::class, 'highlight_id');
    }

    public function stories(): BelongsToMany
    {
        return $this->belongsToMany(Story::class, 'story_highlight_items', 'highlight_id', 'story_id')
            ->withPivot('position')
            ->orderBy('story_highlight_items.position');
    }
}
