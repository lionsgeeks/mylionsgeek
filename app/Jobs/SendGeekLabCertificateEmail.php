<?php

namespace App\Jobs;

use App\Mail\GeekLabCertificateMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SendGeekLabCertificateEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public User $user,
        public string $pdfStoragePath,
        public string $trainingName,
    ) {}

    public function handle(): void
    {
        $email = trim((string) ($this->user->email ?? ''));
        if ($email === '') {
            Log::warning('SendGeekLabCertificateEmail: user has no email', [
                'user_id' => $this->user->id,
            ]);

            return;
        }

        if (! Storage::disk('public')->exists($this->pdfStoragePath)) {
            Log::error('SendGeekLabCertificateEmail: PDF missing', [
                'user_id' => $this->user->id,
                'path' => $this->pdfStoragePath,
            ]);

            throw new \RuntimeException('GeekLab certificate PDF not found for user '.$this->user->id);
        }

        try {
            Mail::to($email)->send(
                new GeekLabCertificateMail($this->user, $this->pdfStoragePath, $this->trainingName)
            );
        } catch (\Throwable $e) {
            Log::error('SendGeekLabCertificateEmail failed', [
                'user_id' => $this->user->id,
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
