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

    /**
     * Max emails this job will send (batches of 100).
     */
    public const BATCH_SIZE = 100;

    /**
     * @param  list<array{user_id:int|string, pdf_storage_path:string}>  $recipients
     */
    public function __construct(
        public array $recipients,
        public string $trainingName,
    ) {
        $this->recipients = array_values(array_slice($recipients, 0, self::BATCH_SIZE));
    }

    public function handle(): void
    {
        foreach ($this->recipients as $recipient) {
            $userId = $recipient['user_id'] ?? null;
            $pdfStoragePath = $recipient['pdf_storage_path'] ?? null;

            if ($userId === null || ! is_string($pdfStoragePath) || $pdfStoragePath === '') {
                Log::warning('SendGeekLabCertificateEmail: invalid recipient payload', [
                    'recipient' => $recipient,
                ]);

                continue;
            }

            $user = User::find($userId);
            if (! $user) {
                Log::warning('SendGeekLabCertificateEmail: user not found', [
                    'user_id' => $userId,
                ]);

                continue;
            }

            $email = trim((string) ($user->email ?? ''));
            if ($email === '') {
                Log::warning('SendGeekLabCertificateEmail: user has no email', [
                    'user_id' => $user->id,
                ]);

                continue;
            }

            if (! Storage::disk('public')->exists($pdfStoragePath)) {
                Log::error('SendGeekLabCertificateEmail: PDF missing', [
                    'user_id' => $user->id,
                    'path' => $pdfStoragePath,
                ]);

                continue;
            }

            try {
                Mail::to($email)->send(
                    new GeekLabCertificateMail($user, $pdfStoragePath, $this->trainingName)
                );
            } catch (\Throwable $e) {
                Log::error('SendGeekLabCertificateEmail failed for recipient', [
                    'user_id' => $user->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);

                // Re-throw so the whole batch can retry (up to $tries).
                throw $e;
            }
        }
    }
}
