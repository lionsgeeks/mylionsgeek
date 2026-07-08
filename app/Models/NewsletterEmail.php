<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterEmail extends Model
{
    protected $fillable = [
        'subject',
        'body',
        'body_fr',
        'body_ar',
        'body_en',
        'recipients_count',
        'sent_by',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
