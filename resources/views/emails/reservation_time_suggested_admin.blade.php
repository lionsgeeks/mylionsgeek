@extends('emails.layouts.customMail')

@section('content')
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <h2 style="color: #2c3e50;">User suggested a new time 📝</h2>
        <p style="font-size: 16px; line-height: 1.6;">User <strong>{{ $user_name }}</strong> suggested an alternative time for reservation <strong>#{{ $reservation_id }}</strong>.</p>

        <div style="background-color: #eef2ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; margin-top: 0;">Suggested Details:</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> {{ $suggested_day }}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> {{ $suggested_start }} - {{ $suggested_end }}</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; border-left: 4px solid #64748b;">
            <p style="margin: 5px 0; color:#374151;"><strong>Original proposal:</strong> {{ $proposed_day }} {{ $proposed_start }} - {{ $proposed_end }}</p>
        </div>

        <table cellspacing="0" cellpadding="0" role="presentation" style="margin: 18px 0 0;">
            <tr>
                @if(!empty($approve_url))
                <td style="padding-right:8px;">
                    <a href="{{ $approve_url }}" style="background-color:#27ae60;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">Approve this time</a>
                </td>
                @endif
                @if(!empty($details_url))
                <td>
                    <a href="{{ $details_url }}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:6px;display:inline-block;">View reservation</a>
                </td>
                @endif
            </tr>
        </table>

        <p style="margin-top: 28px; font-size: 15px;">Regards,<br><strong>LionsGeek</strong> System</p>
    </div>
@endsection


