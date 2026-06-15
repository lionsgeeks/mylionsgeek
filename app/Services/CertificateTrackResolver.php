<?php

namespace App\Services;

class CertificateTrackResolver
{
    /**
     * Resolve certificate track from the user's field value.
     *
     * @return 'coding'|'media'|null
     */
    public function resolve(?string $field): ?string
    {
        $normalized = strtolower(trim((string) $field));

        if ($normalized === '') {
            return null;
        }

        if (
            $normalized === 'coding'
            || str_contains($normalized, 'coding')
            || str_contains($normalized, 'code')
            || str_contains($normalized, 'dev')
        ) {
            return 'coding';
        }

        if (
            $normalized === 'media'
            || str_contains($normalized, 'media')
            || str_contains($normalized, 'content')
            || str_contains($normalized, 'studio')
        ) {
            return 'media';
        }

        return null;
    }

    public function label(?string $field): ?string
    {
        return match ($this->resolve($field)) {
            'coding' => 'CODING / DÉVELOPPEMENT WEB',
            'media' => 'CRÉATEUR-RICE UGC / MARKETING DIGITAL',
            default => null,
        };
    }
}
