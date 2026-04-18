<?php

namespace App\Mail;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class InterviewScheduledToApplicantMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $applicant,
        public User $recruiter,
        public string $interviewTitle,
        public ?string $jobTitle,
        public Carbon $startsAt,
        public Carbon $endsAt,
        public ?string $notes,
    ) {}

    public function build()
    {
        $tz = config('app.timezone');
        $startLocal = $this->startsAt->copy()->timezone($tz);
        $endLocal = $this->endsAt->copy()->timezone($tz);

        $subjectLine = $this->jobTitle
            ? __('Interview scheduled: :job', ['job' => $this->jobTitle])
            : __('Interview scheduled');

        $notesPlain = $this->notes ? Str::limit(trim(strip_tags($this->notes)), 800) : null;

        $startFormatted = $startLocal->translatedFormat('l j F Y').', '.$startLocal->format('H:i');

        return $this->subject($subjectLine)
            ->view('emails.interview-scheduled-applicant')
            ->with([
                'subjectLine' => $subjectLine,
                'applicantName' => $this->applicant->name,
                'recruiterName' => $this->recruiter->name,
                'interviewTitle' => $this->interviewTitle,
                'jobTitle' => $this->jobTitle,
                'startFormatted' => $startFormatted,
                'endTimeFormatted' => $endLocal->format('H:i'),
                'notesPlain' => $notesPlain,
            ]);
    }
}
