<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProjectInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public ProjectInvitation $invitation,
        public ?string $personalMessage = null
    ) {
    }

    public function build(): self
    {
        try {
            $acceptUrl = route('projects.join', [
                'project' => $this->project->id,
                'token' => $this->invitation->token
            ]);
        } catch (\Exception $e) {
            // Fallback to url() if route() fails
            $acceptUrl = url("/projects/{$this->project->id}/join/{$this->invitation->token}");
        }

        return $this->subject(config('app.name') . ' - Invitation to join project: ' . $this->project->name)
            ->view('emails.project-invitation')
            ->with([
                'project' => $this->project,
                'invitation' => $this->invitation,
                'acceptUrl' => $acceptUrl,
                'personalMessage' => $this->personalMessage,
            ]);
    }
}






