<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentRequestMail extends Mailable
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
        $subject = 'New Appointment Request';
        return $this->subject($subject)
            ->view('emails.appointment-request')
            ->with($d);
    }
}

