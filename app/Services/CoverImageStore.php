<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;

/**
 * Stores cover photos under public/storage/img/cover and removes the previous
 * file once it is no longer used. The saved value is "img/cover/<filename>",
 * which is the path both the web profile and the mobile app already request.
 */
class CoverImageStore
{
    public const DIRECTORY = 'storage/img/cover';

    public function store(UploadedFile $file): string
    {
        $directory = public_path(self::DIRECTORY);
        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $filename = $file->hashName();
        $file->move($directory, $filename);

        return 'img/cover/'.$filename;
    }

    public function deletePrevious(?string $previous, string $current, int $userId): void
    {
        $name = $this->resolveFilename($previous);

        if ($name === null || $name === $this->resolveFilename($current)) {
            return;
        }

        $candidates = array_values(array_unique(array_filter([
            is_string($previous) ? trim($previous) : null,
            $name,
            'img/cover/'.$name,
        ])));

        $stillUsed = User::query()
            ->where('id', '!=', $userId)
            ->whereIn('cover', $candidates)
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
        $value = ltrim($value, '/');

        if ($value === '' || preg_match('#^[a-z][a-z0-9+.-]*://#i', $value)) {
            return null;
        }

        foreach (['storage/img/cover/', 'img/cover/'] as $prefix) {
            if (str_starts_with($value, $prefix)) {
                $value = substr($value, strlen($prefix));
                break;
            }
        }

        if ($value === '' || str_contains($value, '/') || str_starts_with($value, '.')) {
            return null;
        }

        return $value;
    }
}
