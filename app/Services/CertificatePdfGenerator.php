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

            // --- Student name: Creattion Demo, auto-sized, pure black, centered ---
            if (isset($positions['name']) && is_array($positions['name'])) {
                $nameCfg = $positions['name'];
                $fontSize = (int) ($nameCfg['size'] ?? 65);
                $minSize = 24;

                // Normalize spaces so every run of whitespace becomes a single space,
                // preventing collapsed or missing inter-word gaps with custom TTF fonts.
                $displayName = preg_replace('/\s+/u', ' ', trim($studentName));

                // Fit the name within 80% of the page width, stepping down 2pt at a time.
                $safeWidth = $pageWidth * 0.80;
                do {
                    $pdf->SetFont($nameFont, '', $fontSize);
                    if ($pdf->GetStringWidth($displayName) <= $safeWidth || $fontSize <= $minSize) {
                        break;
                    }
                    $fontSize -= 2;
                } while (true);

                // Stroke width scales with font size so the boldness looks proportional.
                $strokeWidth = round($fontSize * 0.018, 1.5);

                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetDrawColor(0, 0, 0);
                // TCPDF: setTextRenderingMode($strokeWidth, $fill, $clip) → PDF mode 2 (fill + stroke).
                // (This TCPDF build has no setWordSpacing().)
                $pdf->setTextRenderingMode($strokeWidth, true, false);

                $y = isset($nameCfg['y_pct'])
                    ? $pageHeight * (float) $nameCfg['y_pct'] / 100
                    : (float) ($nameCfg['y'] ?? 99);
                $pdf->SetXY(0, $y);
                $pdf->Cell($pageWidth, 0, $displayName, 0, 0, 'C');

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
}
