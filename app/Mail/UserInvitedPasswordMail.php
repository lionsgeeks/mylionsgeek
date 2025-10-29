<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInvitedPasswordMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $plainPassword) {}

    public function build(): self
    {
        return $this->subject(config('app.name').' - Your account credentials')
            ->view('emails.user-invited-password')
            ->with([
                'user' => $this->user,
                'plainPassword' => $this->plainPassword,
                'loginUrl' => url('/login'),
            ]);
    }
}
