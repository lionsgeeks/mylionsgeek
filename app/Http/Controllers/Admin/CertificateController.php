<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CertificatePdfGenerator;
use App\Services\CertificateTrackResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    /**
     * Generate and stream a single student's certificate as a direct PDF download.
     *
     * POST /admin/users/{user}/certificate/download
     * Body: { "issued_date": "YYYY-MM-DD" }
     */
    public function download(
        User $user,
        Request $request,
        CertificateTrackResolver $trackResolver,
        CertificatePdfGenerator $pdfGenerator,
    ) {
        $validated = $request->validate([
            'issued_date' => 'required|date',
        ]);

        if (empty(trim((string) ($user->name ?? '')))) {
            return response()->json(
                ['error' => 'Missing required field: name. Cannot generate certificate.'],
                422,
            );
        }

        $track = $trackResolver->resolve($user->field ?? null);
        if ($track === null) {
            return response()->json(
                ['error' => 'Unknown student field: cannot determine certificate type.'],
                422,
            );
        }

        $issuedCarbon = Carbon::parse($validated['issued_date'])->startOfDay();
        $issuedDateFormatted = $issuedCarbon->format('d/m/Y');

        $pdfBytes = $pdfGenerator->generate($track, (string) $user->name, $issuedDateFormatted);

        if ($pdfBytes === null || $pdfBytes === '') {
            return response()->json(
                ['error' => 'Certificate generation failed. Verify that the template PDF exists on the server.'],
                500,
            );
        }

        $safeName = Str::slug((string) $user->name);
        $safeDate = $issuedCarbon->format('d-m-Y');
        $fileName = "certificate_{$safeName}_{$safeDate}.pdf";

        return response($pdfBytes, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Cache-Control'       => 'no-cache, no-store',
        ]);
    }
}
