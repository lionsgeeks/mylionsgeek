<?php

namespace App\Http\Controllers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

abstract class Controller
{
    /**
     * Compress (and optionally resize) an image and store it on the public disk.
     *
     * @param UploadedFile|string $source
     * @param string $destinationDirectory
     * @param string|null $targetFilename
     * @param int $quality
     * @param int|null $maxWidth
     * @param int|null $maxHeight
     * @return string
     */
    protected function compressImage(
        $source,
        string $destinationDirectory,
        ?string $targetFilename = null,
        int $quality = 75,
        ?int $maxWidth = null,
        ?int $maxHeight = null
    ): string {
        // Validate input type
        if ($source instanceof UploadedFile) {
            $sourcePath = $source->getRealPath();
            $originalExtension = strtolower($source->getClientOriginalExtension() ?: 'jpg');
        } elseif (is_string($source)) {
            $sourcePath = $source;
            $originalExtension = pathinfo($source, PATHINFO_EXTENSION) ?: 'jpg';
        } else {
            throw new \InvalidArgumentException('Invalid source provided to compressImage.');
        }

        // Load image via Intervention (v3 uses read())
        $image = Image::read($sourcePath);

        // Optional resize while maintaining aspect ratio
        if ($maxWidth !== null || $maxHeight !== null) {
            $image->resize($maxWidth, $maxHeight, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        // Determine file extension
        $extension = $targetFilename
            ? strtolower(pathinfo($targetFilename, PATHINFO_EXTENSION))
            : $originalExtension;

        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            $extension = 'jpg';
        }

        // Generate a new filename if not provided
        if ($targetFilename === null) {
            $targetFilename = Str::uuid()->toString() . '.' . $extension;
        } elseif (pathinfo($targetFilename, PATHINFO_EXTENSION) === '') {
            $targetFilename .= '.' . $extension;
        }

        // Select encoder based on extension (Intervention Image v3)
        switch ($extension) {
            case 'png':
                // PNG is lossless; quality isn't used the same way. Use default compression.
                $image = $image->toPng();
                break;
            case 'webp':
                $image = $image->toWebp($quality);
                break;
            case 'jpg':
            case 'jpeg':
            default:
                $image = $image->toJpeg($quality);
                break;
        }

        // Get encoded binary string
        $encoded = (string) $image;

        // Save to the "public" disk
        $disk = Storage::disk('public');
        $destinationDirectory = trim($destinationDirectory, '/');
        if (!$disk->exists($destinationDirectory)) {
            $disk->makeDirectory($destinationDirectory);
        }

        $relativePath = $destinationDirectory . '/' . $targetFilename;
        $disk->put($relativePath, $encoded);

        return $relativePath;
    }
}
