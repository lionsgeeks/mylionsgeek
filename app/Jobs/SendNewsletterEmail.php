<?php

namespace App\Jobs;

use App\Mail\NewsletterMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendNewsletterEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;
    public $subject;
    public $body;
    public $body_fr;
    public $body_ar;
    public $body_en;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, string $subject, string $body = null, string $body_fr = null, string $body_ar = null, string $body_en = null)
    {
        $this->user = $user;
        $this->subject = $subject;
        $this->body = $body;
        $this->body_fr = $body_fr;
        $this->body_ar = $body_ar;
        $this->body_en = $body_en;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::to($this->user->email)->send(
                new NewsletterMail($this->user, $this->subject, $this->body, $this->body_fr, $this->body_ar, $this->body_en)
            );
        } catch (\Exception $e) {
            Log::error("Failed to send newsletter email to {$this->user->email}: " . $e->getMessage());
            throw $e; // Re-throw to mark job as failed
        }
    }
}

