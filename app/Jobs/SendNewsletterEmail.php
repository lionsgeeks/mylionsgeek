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

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, string $subject, string $body)
    {
        $this->user = $user;
        $this->subject = $subject;
        $this->body = $body;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::to($this->user->email)->send(
                new NewsletterMail($this->user, $this->subject, $this->body)
            );
        } catch (\Exception $e) {
            Log::error("Failed to send newsletter email to {$this->user->email}: " . $e->getMessage());
            throw $e; // Re-throw to mark job as failed
        }
    }
}

