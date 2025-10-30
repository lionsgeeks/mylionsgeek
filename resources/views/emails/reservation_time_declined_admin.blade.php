@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Reservation time declined ❌</h2>
        <p style="font-size: 16px; line-height: 1.6;">User <strong>{{ $user_name }}</strong> declined the proposed time for reservation <strong>#{{ $reservation_id }}</strong>.</p>

        <div style="background-color: #fff7ed; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h3 style="color: #b45309; margin-top: 0;">Proposed (declined):</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>

        <p style="font-size: 15px; color: #555;">Consider proposing another time or wait for a suggestion from the user.</p>
        <p style="margin-top: 28px; font-size: 15px;">Regards,<br><strong>LionsGeek</strong> System</p>
    </div>
@endsection


