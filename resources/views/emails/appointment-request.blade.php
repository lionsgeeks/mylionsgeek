@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $person_name }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            You have received a new <strong style="color: #2563eb;">appointment request</strong>.
        </p>

        <div style="background-color: #eef2ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; margin-top: 0;">Appointment Details:</h3>
            <p style="margin: 5px 0;"><strong>Requested by:</strong> {{ $requester_name }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $requester_email }}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>

        <table cellspacing="0" cellpadding="0" role="presentation" style="margin: 20px 0;">
            <tr>
                <td style="padding-right: 8px;">
                    <a href="{{ $approve_url }}" style="background-color:#27ae60;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Approve</a>
                </td>
                <td style="padding-right: 8px;">
                    <a href="{{ $cancel_url }}" style="background-color:#e74c3c;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Cancel</a>
                </td>
                @if(isset($suggest_url))
                <td>
                    <a href="{{ $suggest_url }}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Suggest New Time</a>
                </td>
                @endif
            </tr>
        </table>

        <p style="font-size: 15px; color: #555;">
            Please click one of the buttons above to approve or cancel this appointment request.
        </p>

        <p style="margin-top: 28px; font-size: 15px;">Best regards,<br><strong>LionsGeek</strong> Team 🦁</p>
    </div>
@endsection

