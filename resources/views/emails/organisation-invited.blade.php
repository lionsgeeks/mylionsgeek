@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #e67e22;">Welcome to LionsGeek — Organisation access</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Hello,<br><br>
            Your organisation has been invited to <strong>LionsGeek</strong>. Use the button below to complete your company profile and set your password.
        </p>

        <div style="background-color: #eaf6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h4 style="color: #2c3e50; margin-top: 0;">What you will set up</h4>
            <ul style="color: #2c3e50; margin: 10px 0;">
                <li>Company name, sector, and contact details</li>
                <li>Office location and phone number</li>
                <li>A secure password for your organisation account</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ $completeProfileUrl }}"
                style="background-color: #ffc801; color: black; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                Complete organisation profile
            </a>
        </div>

        <p style="font-size: 15px; color: #555;">
            This link is personal and expires after {{ $expiresHours }} hours. If it stops working, ask your LionsGeek contact to send a new invitation.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team
        </p>
    </div>
@endsection
