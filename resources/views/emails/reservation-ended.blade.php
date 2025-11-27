@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Reservation Completed ⏰</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            A reservation has reached its <strong style="color: #28a745;">end time</strong> and may require your attention.
        </p>

        <div style="background-color: #d4edda; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Reservation Details:</h3>
            <p style="margin: 5px 0;"><strong>Reserved By:</strong> {{ $user->name }}</p>
            <p style="margin: 5px 0;"><strong>User Email:</strong> {{ $user->email }}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{ $reservation->title ?? 'Studio Reservation' }}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $reservation->day ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $reservation->start ?? 'N/A' }} - {{ $reservation->end ?? 'N/A' }}</p>
            <p style="margin: 5px 0;"><strong>Reservation ID:</strong> #{{ $reservation->id }}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> {{ ucfirst($reservation->type ?? 'studio') }}</p>
            @if($reservation->description)
                <p style="margin: 5px 0;"><strong>Description:</strong> {{ $reservation->description }}</p>
            @endif
            @if(isset($reservation->studio_name))
                <p style="margin: 5px 0;"><strong>Studio:</strong> {{ $reservation->studio_name }}</p>
            @endif
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Action Required:</h4>
            <p style="margin: 5px 0; color: #856404;">
                Please verify that the reservation has been completed and check the studio/equipment condition if necessary.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('admin.reservations.details', $reservation->id) }}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">
                📋 View Reservation Details
            </a>
            <a href="{{ $verificationLink }}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                ✅ Verify Completion
            </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
            You can also manage this reservation by logging into the admin panel and navigating to the reservations section.
        </p>

        <p style="margin-top: 40px; font-size: 15px;">
            Best regards,<br>
            The <strong>LionsGeek</strong> System 🦁
        </p>
    </div>
@endsection

