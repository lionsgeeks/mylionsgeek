<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Computer extends Model
{
    use HasFactory;
    // Use default auto-increment integer ID
    protected $fillable = [
        'id',
        'reference', 
        'cpu', 
        'gpu', 
        'state', 
        'mark', 
        'user_id', 
        'start', 
        'end'
    ];

    protected $casts = [
        'start' => 'date',
        'end' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ComputerHistory::class, 'computer_id', 'id')->orderBy('start', 'desc');
    }
}


