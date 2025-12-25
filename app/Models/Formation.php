<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;
    
    // Use default integer auto-incrementing IDs (matches database schema)
    // Removed UUID configuration to match $table->id() in migration

    protected $fillable = [
        "name",
        "img",
        "category",
        "start_time",
        "end_time",
        "promo",
        "user_id",
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

    /**
     * Get Exercises for this formation.
     */
    public function exercices()
    {
        return $this->hasMany(Exercices::class, 'training_id');
    }

}
