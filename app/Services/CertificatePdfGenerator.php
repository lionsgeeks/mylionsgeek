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
            // Convert font once; subsequent calls return the cached name instantly.
            // addTTFfont() writes the TCPDF font definition files to the TCPDF fonts
            // directory so SetFont() can locate them by the returned name.
            $tcpdfFontsDir = base_path('vendor/tecnickcom/tcpdf/fonts/');
            $nameFont = TCPDF_FONTS::addTTFfont(
                public_path('assets/fonts/GreatVibes-Regular.ttf'),
                'TrueTypeUnicode',
                '',
                32,
                $tcpdfFontsDir,
            );

            if (! $nameFont) {
                Log::error('CertificatePdfGenerator: failed to load Great Vibes font');

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
            $size  = $pdf->getTemplateSize($tplId);
            $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height']);

            $pageWidth  = (float) $size['width'];
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

            // --- Student name: Great Vibes, 65pt, pure black, centered ---
            if (isset($positions['name']) && is_array($positions['name'])) {
                $nameCfg = $positions['name'];
                $fontSize = (int) ($nameCfg['size'] ?? 65);
                $pdf->SetFont($nameFont, '', $fontSize);
                $pdf->SetTextColor(0, 0, 0);
                // y_pct takes priority over absolute y, allowing template-agnostic positioning
                $y = isset($nameCfg['y_pct'])
                    ? $pageHeight * (float) $nameCfg['y_pct'] / 100
                    : (float) ($nameCfg['y'] ?? 99);
                $pdf->SetXY(0, $y);
                $pdf->Cell($pageWidth, 0, $studentName, 0, 0, 'C');
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
