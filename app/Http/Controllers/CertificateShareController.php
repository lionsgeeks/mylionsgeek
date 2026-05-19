<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

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

        $pdfPath = 'certificates/' . $trainingId . '/' . $user->id . '.pdf';
        $pdfUrl = Storage::disk('public')->exists($pdfPath)
            ? url('/storage/' . $pdfPath)
            : null;

        $shareUrl = url('/certificates/share/' . $token);

        $field = strtolower((string) ($user->field ?? ''));
        $track = str_contains($field, 'media') ? 'Media' : (str_contains($field, 'coding') || str_contains($field, 'dev') || str_contains($field, 'code') ? 'Coding' : 'Program');

        $title = 'LionsGeek Certificate';
        $description = $user->name . " is now certified at LionsGeek ({$track}).";

        return response()->view('certificates.share', [
            'user' => $user,
            'shareUrl' => $shareUrl,
            'imageUrl' => $pdfUrl,
            'pdfUrl' => $pdfUrl,
            'title' => $title,
            'description' => $description,
        ]);
    }
}
