@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">Hello {{ $user_name ?? 'there' }} 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
            We'd like to propose a <strong style="color: #2563eb;">new time</strong> for your reservation.
        </p>

        <div style="background-color: #eef2ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; margin-top: 0;">Proposed Details:</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $proposed_day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $proposed_start }} - {{ $proposed_end }}</p>
        </div>

        <table cellspacing="0" cellpadding="0" role="presentation" style="margin: 10px 0 20px;">
            <tr>
                <td style="padding-right: 8px;">
                    <a href="{{ $accept_url }}" style="background-color:#27ae60;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">Accept</a>
                </td>
                <td style="padding-right: 8px;">
                    <a href="{{ $cancel_url }}" style="background-color:#e74c3c;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">Decline</a>
                </td>
                <td>
                    <a href="{{ $suggest_url }}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">Suggest another time</a>
                </td>
            </tr>
        </table>

        <p style="font-size: 15px; color: #555;">
            If none of these work, you can suggest a different date and time using the button above.
        </p>

        <p style="margin-top: 28px; font-size: 15px;">Best regards,<br><strong>LionsGeek</strong> Team 🦁</p>
    </div>
@endsection


