<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewPasswordNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public $plainPassword;

    public function __construct($user, $plainPassword)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your New Password for LionsGeek',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ResetPassword',
            with: [
                'user' => $this->user,
                'password' => $this->plainPassword,
                'loginLink' => route('login'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
