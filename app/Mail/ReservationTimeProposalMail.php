<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationTimeProposalMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $d = $this->data;
        $subject = 'New proposed time for your reservation';

        return $this->subject($subject)
            ->view('emails.reservation_time_proposal')
            ->with($d);
    }
}
