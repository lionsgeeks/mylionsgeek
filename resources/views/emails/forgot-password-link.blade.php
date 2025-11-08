@extends('emails.layouts.customMail')

@section('content')
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #2c3e50;">Hello {{ $user->name }} </h2>

        <p style="font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your <strong>LionsGeek</strong> account.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            Click the button below to set a new password. If you didn't request this, you can ignore this email.
        </p>

        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ $resetUrl }}" style="background-color: #ffc801; color: black; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                Reset Password
            </a>
        </div>

        <p style="font-size: 14px; color: #555;">
            This password reset link will expire in 60 minutes.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 
        </p>
    </div>
@endsection



