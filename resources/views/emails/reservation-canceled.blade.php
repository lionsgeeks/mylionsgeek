@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user->name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            We regret to inform you that your reservation has been <strong style="color: #e74c3c;">canceled</strong> ❌
        </p>

        <div style="background-color: #fdf2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <h3 style="color: #e74c3c; margin-top: 0;">Reservation Details:</h3>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{ $reservation->title ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $reservation->date ?? $reservation->day ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $reservation->start ?? 'N/A' }} - {{ $reservation->end ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Reservation ID:</strong> #{{ $reservation->id }}</p>
            @if($reservation->description)
                <p style="margin: 5px 0;"><strong>Description:</strong> {{ $reservation->description }}</p>
            @endif
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
            We apologize for any inconvenience this may cause. If you have any questions about this cancellation or would like to make a new reservation, please don't hesitate to contact our support team.
        </p>

        <p style="font-size: 15px; color: #555;">
            We hope to serve you better in the future at <strong>LionsGeek</strong>.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> Team 🦁
        </p>
    </div>
@endsection
