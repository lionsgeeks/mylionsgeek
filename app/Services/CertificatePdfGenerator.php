<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Fpdi;

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
            $pdf = new Fpdi('L', 'mm', 'A4');
            $pdf->SetAutoPageBreak(false);
            $pdf->SetMargins(0, 0, 0);
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

            if (isset($positions['date']) && is_array($positions['date'])) {
                $dateCfg = $positions['date'];
                $pdf->SetFont('Helvetica', (string) ($dateCfg['style'] ?? ''), (int) ($dateCfg['size'] ?? 12));
                $pdf->SetTextColor(85, 85, 85);
                $pdf->SetXY((float) ($dateCfg['x'] ?? 32), (float) ($dateCfg['y'] ?? 138));
                $pdf->Cell(0, 0, $this->toPdfString($issuedDateFormatted));
            }

            if (isset($positions['name']) && is_array($positions['name'])) {
                $nameCfg = $positions['name'];
                $pdf->SetFont('Helvetica', (string) ($nameCfg['style'] ?? 'B'), (int) ($nameCfg['size'] ?? 22));
                $pdf->SetTextColor(44, 44, 44);
                $nameText = $this->toPdfString($studentName);
                $nameWidth = $pdf->GetStringWidth($nameText);
                $x = max(0, ($pageWidth - $nameWidth) / 2);
                $pdf->SetXY($x, (float) ($nameCfg['y'] ?? 118));
                $pdf->Cell(0, 0, $nameText);
            }

            return $pdf->Output('S');
        } catch (\Throwable $e) {
            Log::error('CertificatePdfGenerator failed', [
                'track' => $track,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    private function toPdfString(string $text): string
    {
        $converted = @mb_convert_encoding($text, 'ISO-8859-1', 'UTF-8');

        return $converted !== false ? $converted : $text;
    }
}
