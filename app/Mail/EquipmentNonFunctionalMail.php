<?php

namespace App\Mail;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EquipmentNonFunctionalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $equipment;

    public $admin;

    /**
     * Create a new message instance.
     */
    public function __construct(Equipment $equipment, User $admin)
    {
        $this->equipment = $equipment;
        $this->admin = $admin;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Equipment Alert: '.$this->equipment->reference.' is Non-Functional',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.equipment-non-functional',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
