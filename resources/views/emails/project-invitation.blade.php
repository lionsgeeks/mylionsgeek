@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #e67e22;">Project Invitation 🦁</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Hello,<br><br>
            You have been invited to join the project <strong>{{ $project->name }}</strong> on <strong>LionsGeek</strong>.
        </p>

        @if($personalMessage)
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3 style="color: #e67e22; margin-top: 0;">Personal Message:</h3>
            <p style="margin: 5px 0; color: #2c3e50;">{{ $personalMessage }}</p>
        </div>
        @endif

        <div style="background-color: #eaf6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h4 style="color: #2c3e50; margin-top: 0;">Project Details:</h4>
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Project Name:</strong> {{ $project->name }}</p>
            @if($project->description)
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Description:</strong> {{ $project->description }}</p>
            @endif
            <p style="margin: 5px 0; color: #2c3e50;"><strong>Your Role:</strong> {{ ucfirst($invitation->role) }}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $acceptUrl }}" 
               style="display: inline-block; background-color: #ffc801; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Accept Invitation
            </a>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="{{ $acceptUrl }}" style="color: #3498db; word-break: break-all;">{{ $acceptUrl }}</a>
        </p>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Note:</strong> This invitation will expire on {{ $invitation->expires_at->format('F d, Y') }}. 
                You must be logged in to accept this invitation.
            </p>
        </div>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
