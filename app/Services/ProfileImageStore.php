<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;

/**
 * Stores profile pictures under public/storage/img/profile and removes the
 * previous file once it is no longer used.
 */
class ProfileImageStore
{
    public const DIRECTORY = 'storage/img/profile';

    /** Shared placeholder every new account starts with (users.image default). */
    public const DEFAULT_IMAGE = 'pdp.png';

    /**
     * Move the uploaded picture into the profile folder and return its filename.
     */
    public function store(UploadedFile $file): string
    {
        $filename = $file->hashName();
        $file->move(public_path(self::DIRECTORY), $filename);

        return $filename;
    }

    /**
     * Delete the user's previous picture file when nobody else uses it.
     *
     * Only plain filenames (or "img/profile/<name>") inside the profile folder
     * are touched; external URLs, the default placeholder and anything that
     * tries to leave the folder are ignored.
     */
    public function deletePrevious(?string $previous, string $current, int $userId): void
    {
        $name = $this->resolveFilename($previous);

        if ($name === null || $name === $current || $name === self::DEFAULT_IMAGE) {
            return;
        }

        $stillUsed = User::query()
            ->where('id', '!=', $userId)
            ->where('image', $previous)
            ->exists();

        if ($stillUsed) {
            return;
        }

        $path = public_path(self::DIRECTORY).DIRECTORY_SEPARATOR.$name;

        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function resolveFilename(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim(str_replace('\\', '/', $value));

        if ($value === '' || preg_match('#^[a-z][a-z0-9+.-]*://#i', $value)) {
            return null;
        }

        if (str_starts_with($value, 'img/profile/')) {
            $value = substr($value, strlen('img/profile/'));
        }

        // Must be a bare filename: no folders, no traversal, no hidden files.
        if ($value === '' || str_contains($value, '/') || str_starts_with($value, '.')) {
            return null;
        }

        return $value;
    }
}
