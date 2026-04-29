<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class Message extends Model
{
    private const BODY_ENCRYPTED_PREFIX = 'enc::';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'attachment_path',
        'attachment_type',
        'attachment_name',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Encrypt message body before persisting it in DB.
     */
    public function setBodyAttribute($value): void
    {
        $plainBody = (string) ($value ?? '');

        if ($plainBody === '') {
            $this->attributes['body'] = '';
            return;
        }

        if (str_starts_with($plainBody, self::BODY_ENCRYPTED_PREFIX)) {
            $this->attributes['body'] = $plainBody;
            return;
        }

        $this->attributes['body'] = self::BODY_ENCRYPTED_PREFIX . Crypt::encryptString($plainBody);
    }

    /**
     * Decrypt message body when reading so clients receive plaintext.
     */
    public function getBodyAttribute($value): string
    {
        $storedBody = (string) ($value ?? '');

        if ($storedBody === '') {
            return '';
        }

        if (!str_starts_with($storedBody, self::BODY_ENCRYPTED_PREFIX)) {
            return $storedBody;
        }

        try {
            return Crypt::decryptString(substr($storedBody, strlen(self::BODY_ENCRYPTED_PREFIX)));
        } catch (\Throwable $exception) {
            // Fallback avoids breaking chat if payload is malformed/legacy.
            return $storedBody;
        }
    }

    /**
     * Get the conversation this message belongs to
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user who sent this message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
