<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class GeekLabCertificateMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $pdfStoragePath,
        public string $trainingName,
    ) {}

    public function build()
    {
        $attachmentName = basename($this->pdfStoragePath) ?: 'certificat.pdf';
        $mail = $this->subject('Votre certificat GeekLab — LionsGeek')
            ->view('emails.geeklab-certificate')
            ->with([
                'user' => $this->user,
                'trainingName' => $this->trainingName,
            ]);

        if (Storage::disk('public')->exists($this->pdfStoragePath)) {
            $mail->attach(Storage::disk('public')->path($this->pdfStoragePath), [
                'as' => $attachmentName,
                'mime' => 'application/pdf',
            ]);
        }

        return $mail;
    }
}
