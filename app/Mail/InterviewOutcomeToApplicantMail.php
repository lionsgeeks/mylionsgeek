<?php

namespace App\Mail;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InterviewOutcomeToApplicantMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $applicant,
        public User $recruiter,
        public string $outcome,
        public ?string $jobTitle,
        public string $interviewTitle,
        public Carbon $startsAt,
    ) {}

    public function build()
    {
        $tz = config('app.timezone');
        $startLocal = $this->startsAt->copy()->timezone($tz);
        $startFormatted = $startLocal->translatedFormat('l j F Y').', '.$startLocal->format('H:i');

        $isAccepted = $this->outcome === 'accepted';

        $subjectLine = $this->jobTitle
            ? ($isAccepted
                ? __('Application accepted: :job', ['job' => $this->jobTitle])
                : __('Application not selected: :job', ['job' => $this->jobTitle]))
            : ($isAccepted
                ? __('Your interview outcome: accepted')
                : __('Your interview outcome: not selected'));

        return $this->subject($subjectLine)
            ->view('emails.interview-outcome-applicant')
            ->with([
                'subjectLine' => $subjectLine,
                'applicantName' => $this->applicant->name,
                'recruiterName' => $this->recruiter->name,
                'outcome' => $this->outcome,
                'isAccepted' => $isAccepted,
                'jobTitle' => $this->jobTitle,
                'interviewTitle' => $this->interviewTitle,
                'startFormatted' => $startFormatted,
            ]);
    }
}
