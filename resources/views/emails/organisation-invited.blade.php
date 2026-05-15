@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #e67e22;">Welcome to LionsGeek — Organisation access</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Hello,<br><br>
            Your organisation has been invited to <strong>LionsGeek</strong>. Use the credentials below to sign in and complete your company profile.
        </p>

        <div style="background-color: #fff8e1; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3 style="color: #e67e22; margin-top: 0;">Login information</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $user->email }}</p>
            <p style="margin: 5px 0;"><strong>Temporary password:</strong> {{ $plainPassword }}</p>
        </div>

        <div style="background-color: #eaf6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h4 style="color: #2c3e50; margin-top: 0;">Next steps</h4>
            <ul style="color: #2c3e50; margin: 10px 0;">
                <li>Sign in using the link below</li>
                <li>Complete your organisation profile (company name, sector, location, and contact details)</li>
                <li>Change your temporary password in settings</li>
            </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
            You can log in here:
            <a href="{{ $loginUrl }}"
               style="color: #3498db; text-decoration: none; font-weight: bold;">Login to LionsGeek</a>
        </p>

        <p style="font-size: 15px; color: #555;">
            For your security, please update your password after your first sign-in.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team
        </p>
    </div>
@endsection
