<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordLinkMail extends Mailable
{
    use SerializesModels;

    public $user;
    public $resetUrl;

    public function __construct($user, string $resetUrl)
    {
        $this->user = $user;
        $this->resetUrl = $resetUrl;
    }

    public function build()
    {
        return $this->subject('Reset your password')
            ->view('emails.forgot-password-link');
    }
}





