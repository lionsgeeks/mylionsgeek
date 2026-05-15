<?php

namespace App\Mail;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmployerInvitedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Organization $organization,
        public string $plainPassword,
    ) {}

    public function build(): self
    {
        return $this->subject(config('app.name').' - Your employer account at '.$this->organization->displayName())
            ->view('emails.employer-invited')
            ->with([
                'user' => $this->user,
                'organization' => $this->organization,
                'plainPassword' => $this->plainPassword,
                'loginUrl' => url('/login'),
            ]);
    }
}
