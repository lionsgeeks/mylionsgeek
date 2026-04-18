@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">{{ __('Interview scheduled') }}</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            {{ __('Hello :name,', ['name' => $applicantName]) }}
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            {{ __('A recruiter has scheduled an interview with you.') }}
        </p>

        @if ($jobTitle)
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc801;">
                <h3 style="color: #b45309; margin-top: 0;">{{ __('Job') }}</h3>
                <p style="margin: 5px 0;"><strong>{{ __('Title') }}:</strong> {{ $jobTitle }}</p>
            </div>
        @endif

        <div style="background-color: #eef2ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; margin-top: 0;">{{ __('Interview') }}</h3>
            <p style="margin: 5px 0;"><strong>{{ __('Title') }}:</strong> {{ $interviewTitle }}</p>
            <p style="margin: 5px 0;"><strong>{{ __('Date and time') }}:</strong> {{ $startFormatted }}</p>
            @if ($locationPlain)
                <p style="margin: 5px 0;"><strong>{{ __('Location') }}:</strong> {{ $locationPlain }}</p>
            @endif
            @if ($notesPlain)
                <p style="margin: 12px 0 0; white-space: pre-wrap;"><strong>{{ __('Notes') }}:</strong><br>{{ $notesPlain }}</p>
            @endif
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0;">{{ __('Recruiter') }}</h3>
            <p style="margin: 5px 0;"><strong>{{ __('Name') }}:</strong> {{ $recruiterName }}</p>
        </div>

        <p style="font-size: 14px; color: #555;">
            {{ __('Times are shown in the platform timezone (:tz).', ['tz' => config('app.timezone')]) }}
        </p>
    </div>
@endsection
