<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** Sent via SendsCredentialsMailAfterResponse (Mail::send in-process, never Mail::queue). */
class OrganisationInvitedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $completeProfileUrl) {}

    public function build(): self
    {
        return $this->subject(config('app.name').' - Complete your organisation profile')
            ->view('emails.organisation-invited')
            ->with([
                'user' => $this->user,
                'completeProfileUrl' => $this->completeProfileUrl,
                'expiresHours' => User::ACTIVATION_TTL_HOURS,
            ]);
    }
}
