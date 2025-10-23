@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user->name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            Great news! Your reservation has been <strong style="color: #27ae60;">approved</strong> ✅
        </p>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h3 style="color: #27ae60; margin-top: 0;">Reservation Details:</h3>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{ $reservation->title ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $reservation->date ?? $reservation->day ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $reservation->start ?? 'N/A' }} - {{ $reservation->end ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Reservation ID:</strong> #{{ $reservation->id }}</p>
            @if($reservation->description)
                <p style="margin: 5px 0;"><strong>Description:</strong> {{ $reservation->description }}</p>
            @endif
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
            You can now proceed with your reservation as planned. If you have any questions or need to make changes, please contact our support team.
        </p>

        <p style="font-size: 15px; color: #555;">
            Thank you for choosing <strong>LionsGeek</strong> for your reservation needs!
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
