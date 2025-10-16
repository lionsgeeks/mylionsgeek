@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Welcome aboard, {{ $user->name }} 🎉</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Congratulations! You've successfully completed your profile on <strong>LionsGeek</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            We're excited to officially welcome you to the LionsGeek community. 🦁 From here on, you're part of a growing
            network of innovators, developers, and tech enthusiasts.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
            You can now explore your Account, connect with others, and access all the tools and features we’ve crafted
            just for you.
        </p>

        <div style="text-align: center; margin: 40px 0;">
            <a href="/login"
                style="background-color: #ffc801; color: black; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                Go to Your account
            </a>
        </div>

        <p style="font-size: 15px; color: #555;">
            If you have any questions or need help, feel free to reach out. Our team is always happy to assist!
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Cheers,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
