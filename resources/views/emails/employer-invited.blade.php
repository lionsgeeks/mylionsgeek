@extends('emails.layouts.customMail')

@section('content')
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #e67e22;">Welcome to LionsGeek — {{ $organization->displayName() }}</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Hello,<br><br>
            You have been invited as an employer at <strong>{{ $organization->displayName() }}</strong> on <strong>LionsGeek</strong>.
            Use the credentials below to sign in and manage job postings for this organisation.
        </p>

        <div style="background-color: #fff8e1; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3 style="color: #e67e22; margin-top: 0;">Login information</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $user->email }}</p>
            <p style="margin: 5px 0;"><strong>Temporary password:</strong> {{ $plainPassword }}</p>
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
