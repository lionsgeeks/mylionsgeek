@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user->name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Your password has been reset by an administrator at <strong>LionsGeek</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            Here are your new login details:
        </p>

        <ul style="font-size: 16px; line-height: 1.6; list-style: none; padding: 0;">
            <li><strong>Email:</strong> {{ $user->email }}</li>
            <li><strong>New Password:</strong> {{ $password }}</li>
        </ul>

        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ $loginLink }}"
                style="background-color: #ffc801; color: black; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                Login Now
            </a>
        </div>

        <p style="font-size: 14px; color: #555;">
            For your security, we recommend changing your password after logging in.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
