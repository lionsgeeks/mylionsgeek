@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Reservation time accepted ✅</h2>
        <p style="font-size: 16px; line-height: 1.6;">User <strong>{{ $user_name }}</strong> accepted the proposed time for reservation <strong>#{{ $reservation_id }}</strong>.</p>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h3 style="color: #27ae60; margin-top: 0;">Finalized Details:</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>

        <p style="font-size: 15px; color: #555;">You can view or manage the reservation in the admin dashboard.</p>
        @if(!empty($details_url))
        <table cellspacing="0" cellpadding="0" role="presentation" style="margin: 12px 0 0;">
            <tr>
                <td>
                    <a href="{{ $details_url }}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">View reservation</a>
                </td>
            </tr>
        </table>
        @endif
        <p style="margin-top: 28px; font-size: 15px;">Regards,<br><strong>LionsGeek</strong> System</p>
    </div>
@endsection


