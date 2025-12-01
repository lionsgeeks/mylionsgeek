@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user_name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            We're sorry to inform you that your appointment request has been <strong style="color: #e74c3c;">canceled</strong>.
        </p>

        <div style="background-color: #fee; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <h3 style="color: #e74c3c; margin-top: 0;">Appointment Details:</h3>
            <p style="margin: 5px 0;"><strong>With:</strong> {{ $person_name }}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
            Unfortunately, {{ $person_name }} is not available at the requested time. Please feel free to book another appointment at a different time.
        </p>

        <p style="font-size: 15px; color: #555;">
            Thank you for your understanding.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection

