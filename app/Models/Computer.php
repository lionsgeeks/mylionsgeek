<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Computer extends Model
{
    use HasFactory;
    public $incrementing = false;       
    protected $keyType = 'string';
    protected $primaryKey = 'uuid';
    protected $fillable = [
        'uuid',
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
}


