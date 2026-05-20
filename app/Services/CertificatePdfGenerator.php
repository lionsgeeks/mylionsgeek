<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Tcpdf\Fpdi;
use TCPDF_FONTS;

class CertificatePdfGenerator
{
    public function __construct(
        private CertificateTrackResolver $trackResolver,
    ) {}

    /**
     * Generate certificate PDF bytes for a student.
     *
     * @param  'coding'|'media'  $track
     * @return string|null Raw PDF bytes
     */
    public function generate(string $track, string $studentName, string $issuedDateFormatted): ?string
    {
        $templateRel = config("certificates.templates.{$track}");
        if (! is_string($templateRel) || $templateRel === '') {
            Log::error('Certificate template config missing', ['track' => $track]);

            return null;
        }

        $templatePath = public_path($templateRel);
        if (! is_file($templatePath)) {
            Log::error('Certificate template file missing', ['track' => $track, 'path' => $templatePath]);

            return null;
        }

        $positions = config("certificates.positions.{$track}");
        if (! is_array($positions)) {
            Log::error('Certificate positions config missing', ['track' => $track]);

            return null;
        }

        try {
            $tcpdfFontsDir = base_path('vendor/tecnickcom/tcpdf/fonts/');
            $bundledCreattion = $tcpdfFontsDir.'creattiondemo.php';
            $ttfPath = public_path('assets/fonts/Creattion Demo.ttf');

            if (is_file($bundledCreattion)) {
                // Shipped TCPDF metrics (creattiondemo.php + .z) — no write to vendor/, fast path.
                $nameFont = 'creattiondemo';
            } elseif (is_file($ttfPath)) {
                $nameFont = TCPDF_FONTS::addTTFfont(
                    $ttfPath,
                    'TrueTypeUnicode',
                    '',
                    32,
                    $tcpdfFontsDir,
                );
                if (! $nameFont) {
                    Log::error('CertificatePdfGenerator: failed to convert Creattion Demo TTF');

                    return null;
                }
            } else {
                Log::error('CertificatePdfGenerator: Creattion Demo font missing (no bundled TCPDF font, no TTF)');

                return null;
            }

            $pdf = new Fpdi('L', 'mm', 'A4');
            $pdf->SetAutoPageBreak(false);
            $pdf->SetMargins(0, 0, 0);
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->AddPage();

            $pageCount = $pdf->setSourceFile($templatePath);
            if ($pageCount < 1) {
                Log::error('Certificate template has no pages', ['path' => $templatePath]);

                return null;
            }

            $tplId = $pdf->importPage(1);
            $size = $pdf->getTemplateSize($tplId);
            $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height']);

            $pageWidth = (float) $size['width'];
            $pageHeight = (float) $size['height'];

            // --- Date: Helvetica, small, grey, centered at bottom ---
            if (isset($positions['date']) && is_array($positions['date'])) {
                $dateCfg = $positions['date'];
                $pdf->SetFont('helvetica', (string) ($dateCfg['style'] ?? ''), (int) ($dateCfg['size'] ?? 12));
                $pdf->SetTextColor(85, 85, 85);
                $y = isset($dateCfg['y_pct'])
                    ? $pageHeight * (float) $dateCfg['y_pct'] / 100
                    : (float) ($dateCfg['y'] ?? 172);
                $pdf->SetXY(0, $y);
                $pdf->Cell($pageWidth, 0, $issuedDateFormatted, 0, 0, 'C');
            }

            // --- Student name: Creattion Demo, pure black, centered ---
            if (isset($positions['name']) && is_array($positions['name'])) {
                $nameCfg = $positions['name'];
                $sizeTwoWords = (int) ($nameCfg['size_two_words'] ?? $nameCfg['size'] ?? 65);
                $sizeMoreWords = (int) ($nameCfg['size_more_words'] ?? $nameCfg['size'] ?? 40);
                // CSS-like px → mm (96dpi), used as extra gap *between* words (in addition to the normal space).
                $extraWordGapMm = 35 * 25.4 / 96;

                $normalized = preg_replace('/\s+/u', ' ', trim($studentName));
                $displayName = $normalized === ''
                    ? ''
                    : mb_convert_case($normalized, MB_CASE_TITLE, 'UTF-8');
                $words = $displayName === '' ? [] : preg_split('/\s+/u', $displayName, -1, PREG_SPLIT_NO_EMPTY);
                $wordCount = count($words);

                $usesTwoWordSize = $this->shouldUseTwoWordNameSize($words);
                $nameFontSize = $usesTwoWordSize ? $sizeTwoWords : $sizeMoreWords;

                $baselineY = isset($nameCfg['y_pct'])
                    ? $pageHeight * (float) $nameCfg['y_pct'] / 100
                    : (float) ($nameCfg['y'] ?? 99);

                $textWidth = $pageWidth * 0.88;
                $pdf->setCellPadding(0);

                $pdf->SetFont($nameFont, '', $nameFontSize);
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetDrawColor(0, 0, 0);

                // Stroke matches two-word style when using size_two_words (incl. "X el Y" names).
                if ($wordCount > 2 && ! $usesTwoWordSize) {
                    $strokeWidth = round($nameFontSize * 0.015, 2);
                } else {
                    $strokeWidth = round($nameFontSize * 0.005, 2);
                }

                $pdf->setTextRenderingMode($strokeWidth, true, false);

                // Two lines only for 3+ words without "el" as the second word (e.g. Fatima Zahra Kadiri…).
                // Names like "Nour El Houda" stay on one line with size_two_words.
                if ($wordCount > 2 && ! $usesTwoWordSize) {
                    $line1Words = array_slice($words, 0, 2);
                    $line2Words = array_slice($words, 2);

                    $lineHeightMm = $nameFontSize * 0.3528 * 1.2;
                    $blockHalf = $lineHeightMm; // two lines ≈ centered on anchor
                    $yFirst = $baselineY - $blockHalf;

                    $this->drawCenteredNameLine($pdf, $pageWidth, $yFirst, $line1Words, $extraWordGapMm);
                    $this->drawCenteredNameLine($pdf, $pageWidth, $yFirst + $lineHeightMm, $line2Words, $extraWordGapMm);
                } else {
                    $lineWords = $words;
                    $totalW = $this->measureNameLineWidth($pdf, $lineWords, 0.0);
                    $stretch = 100;
                    if ($totalW > 0 && $totalW > $textWidth) {
                        $stretch = max(80, (int) floor(($textWidth / $totalW) * 100));
                        $pdf->setFontStretching($stretch);
                        $totalW = $this->measureNameLineWidth($pdf, $lineWords, 0.0);
                    }

                    $fontMm = $nameFontSize * 0.3528;
                    $ascentMm = $fontMm * 0.73;
                    $pdf->SetXY(0, $baselineY - $ascentMm);
                    $this->drawCenteredNameLine($pdf, $pageWidth, $pdf->GetY(), $lineWords, 0.0);

                    if ($stretch !== 100) {
                        $pdf->setFontStretching(100);
                    }
                }

                $pdf->setTextRenderingMode(0, true, false);
            }

            return $pdf->Output('', 'S');
        } catch (\Throwable $e) {
            Log::error('CertificatePdfGenerator failed', [
                'track' => $track,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Use size_two_words for 0–2 words, or when the second word is "el" (e.g. Nour El Houda).
     *
     * @param  list<string>  $words
     */
    private function shouldUseTwoWordNameSize(array $words): bool
    {
        $count = count($words);
        if ($count <= 2) {
            return true;
        }

        return mb_strtolower($words[1], 'UTF-8') === 'el';
    }

    /**
     * @param  list<string>  $words
     */
    private function measureNameLineWidth(Fpdi $pdf, array $words, float $extraGapMm): float
    {
        if ($words === []) {
            return 0.0;
        }
        $width = 0.0;
        $spaceW = $pdf->GetStringWidth(' ');
        $last = count($words) - 1;
        foreach ($words as $i => $word) {
            $width += $pdf->GetStringWidth($word);
            if ($i < $last) {
                $width += $spaceW + $extraGapMm;
            }
        }

        return $width;
    }

    /**
     * @param  list<string>  $words
     */
    private function drawCenteredNameLine(Fpdi $pdf, float $pageWidth, float $y, array $words, float $extraGapMm): void
    {
        if ($words === []) {
            return;
        }
        $spaceW = $pdf->GetStringWidth(' ');
        $total = $this->measureNameLineWidth($pdf, $words, $extraGapMm);
        $pdf->SetXY(($pageWidth - $total) / 2, $y);
        $last = count($words) - 1;
        foreach ($words as $i => $word) {
            $w = $pdf->GetStringWidth($word);
            $pdf->Cell($w, 0, $word, 0, 0, 'L');
            if ($i < $last) {
                $pdf->SetX($pdf->GetX() + $spaceW + $extraGapMm);
            }
        }
    }
}
