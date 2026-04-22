<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Generates a PNG screenshot of a certificate by compositing
 * student data directly onto the certificate template using GD.
 * No Ghostscript or external tools required — only the GD extension.
 */
class CertificateImageGenerator
{
    private const CANVAS_W = 1122;
    private const CANVAS_H = 794;

    // Pixel positions match the Blade template exactly
    private const NAME_Y      = 410;
    private const TITLE_Y     = 480;
    private const TRAINING_Y  = 545;
    private const DATE_X      = 120;
    private const DATE_Y      = 665;

    private const FONT_BOLD    = 'C:\\Windows\\Fonts\\arialbd.ttf';
    private const FONT_REGULAR = 'C:\\Windows\\Fonts\\arial.ttf';

    /**
     * Generate the PNG for a student certificate and store it at
     * storage/app/public/images/certificationImages/{userId}.png
     *
     * @param int    $userId
     * @param string $studentName
     * @param string $field
     * @param string $trainingTitle
     * @param string $issuedDate
     * @return bool  True on success, false on failure.
     */
    public function generate(
        int $userId,
        string $studentName,
        string $field,
        string $trainingTitle,
        string $issuedDate
    ): bool {
        try {
            $templatePath = public_path('assets/images/certif.jpg');
            if (! is_file($templatePath)) {
                Log::error('Certificate template missing', ['path' => $templatePath]);
                return false;
            }

            $canvas = $this->loadTemplate($templatePath);
            if ($canvas === false) {
                Log::error('Failed to load certificate template image');
                return false;
            }

            // Scale the template to the canonical canvas size
            $source = imagecreatefromstring(file_get_contents($templatePath));
            $canvas = imagecreatetruecolor(self::CANVAS_W, self::CANVAS_H);
            imagecopyresampled(
                $canvas, $source,
                0, 0, 0, 0,
                self::CANVAS_W, self::CANVAS_H,
                imagesx($source), imagesy($source)
            );
            imagedestroy($source);

            $resolvedTitle = $this->resolveTitle($field);
            $darkColor     = imagecolorallocate($canvas, 44, 44, 44);     // #2c2c2c
            $midColor      = imagecolorallocate($canvas, 85, 85, 85);     // #555555
            $lightColor    = imagecolorallocate($canvas, 119, 119, 119);  // #777777

            // Student name — bold 56 px, centred
            $this->drawCentredText($canvas, $studentName, self::FONT_BOLD, 56, $darkColor, self::NAME_Y);

            // Resolved title — regular 36 px, centred
            if ($resolvedTitle !== '') {
                $this->drawCentredText($canvas, $resolvedTitle, self::FONT_REGULAR, 36, $midColor, self::TITLE_Y);
            }

            // Training title — regular 28 px, centred
            $this->drawCentredText($canvas, $trainingTitle, self::FONT_REGULAR, 28, $lightColor, self::TRAINING_Y);

            // Issue date — regular 24 px, left-aligned
            imagettftext($canvas, 24, 0, self::DATE_X, self::DATE_Y + 24, $midColor, self::FONT_REGULAR, $issuedDate);

            // Capture PNG bytes and store
            ob_start();
            imagepng($canvas);
            $pngBytes = ob_get_clean();
            imagedestroy($canvas);

            $storagePath = 'images/certificationImages/' . $userId . '.png';
            Storage::disk('public')->put($storagePath, $pngBytes);

            return true;
        } catch (\Throwable $e) {
            Log::error('CertificateImageGenerator failed', [
                'user_id' => $userId,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    // -------------------------------------------------------------------------

    private function resolveTitle(string $field): string
    {
        $normalized = strtolower($field);
        if (str_contains($normalized, 'coding') || str_contains($normalized, 'code') || str_contains($normalized, 'dev')) {
            return 'Full Stack Developer';
        }
        if (str_contains($normalized, 'media') || str_contains($normalized, 'content') || str_contains($normalized, 'studio')) {
            return 'Content Creator';
        }
        return $field;
    }

    /**
     * @param \GdImage $canvas
     */
    private function drawCentredText($canvas, string $text, string $font, int $size, int $color, int $topY): void
    {
        // imagettfbbox returns the bounding box; index 4/5 is the top-right corner
        $bbox  = imagettfbbox($size, 0, $font, $text);
        $textW = abs($bbox[4] - $bbox[0]);
        $x     = (int) ((self::CANVAS_W - $textW) / 2);
        // imagettftext y is the baseline; approximate descent as ~25% of size
        $y     = $topY + $size;
        imagettftext($canvas, $size, 0, $x, $y, $color, $font, $text);
    }

    private function loadTemplate(string $path): \GdImage|false
    {
        $mime = mime_content_type($path);
        return match (true) {
            str_contains($mime, 'jpeg') => imagecreatefromjpeg($path),
            str_contains($mime, 'png')  => imagecreatefrompng($path),
            default                     => false,
        };
    }
}
