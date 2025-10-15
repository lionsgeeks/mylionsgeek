@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user->name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Welcome to <strong>LionsGeek</strong> – we’re thrilled to have you here! 🎉
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            Your account has been successfully created, but it's not active yet. Before you can access our platform, we
            kindly ask you to complete your profile.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            Completing your profile helps us ensure a secure and personalized experience for you within the LionsGeek
            community.
        </p>

        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ url('/complete-profile/form') }}"
                style="background-color: #ffc801; color: black; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                Complete Your Profile
            </a>

        </div>

        <p style="font-size: 15px; color: #555;">
            If you have any questions or need help along the way, don’t hesitate to reach out to our support team. We’re
            here for you!
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
