<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CertificateImageGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CertificateShareController extends Controller
{
    public function show(string $token)
    {
        $user = User::query()
            ->with('formation')
            ->where('certificate_share_token', $token)
            ->firstOrFail();

        $trainingId = $user->certified_training_id;
        if (empty($trainingId)) {
            abort(404);
        }

        $pngPath = 'images/certificationImages/' . $user->id . '.png';

        // Regenerate PNG on-the-fly if missing (e.g. legacy users certified before this feature)
        if (! Storage::disk('public')->exists($pngPath)) {
            $trainingTitle = $user->formation?->name ?? 'LionsGeek Program';
            $issuedDate    = $user->certified_at
                ? \Carbon\Carbon::parse($user->certified_at)->locale('fr_FR')->translatedFormat('d F Y')
                : now()->locale('fr_FR')->translatedFormat('d F Y');

            app(CertificateImageGenerator::class)->generate(
                userId: $user->id,
                studentName: (string) ($user->name ?? ''),
                field: (string) ($user->field ?? ''),
                trainingTitle: $trainingTitle,
                issuedDate: $issuedDate,
            );
        }

        $shareUrl = url('/certificates/share/' . $token);
        $imageUrl = url('/storage/' . $pngPath);

        $field = strtolower((string) ($user->field ?? ''));
        $track = str_contains($field, 'media') ? 'Media' : (str_contains($field, 'coding') || str_contains($field, 'dev') || str_contains($field, 'code') ? 'Coding' : 'Program');

        $title = 'LionsGeek Certificate';
        $description = $user->name . " is now certified at LionsGeek ({$track}).";

        return response()->view('certificates.share', [
            'user' => $user,
            'shareUrl' => $shareUrl,
            'imageUrl' => $imageUrl,
            'title' => $title,
            'description' => $description,
        ]);
    }
}
