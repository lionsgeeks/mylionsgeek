<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $body;
    public $body_fr;
    public $body_ar;
    public $body_en;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $subject, $body = null, $body_fr = null, $body_ar = null, $body_en = null)
    {
        $this->user = $user;
        $this->subject = $subject;
        // Support both old format (single body) and new format (separate languages)
        $this->body = $body;
        $this->body_fr = $body_fr;
        $this->body_ar = $body_ar;
        $this->body_en = $body_en;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter',
            with: [
                'user' => $this->user,
                'subject' => $this->subject,
                'body' => $this->body,
                'body_fr' => $this->body_fr,
                'body_ar' => $this->body_ar,
                'body_en' => $this->body_en,
            ],
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

