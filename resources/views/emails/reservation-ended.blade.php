<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reservation Completed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Reservation Completed - Verification Required</h2>
        
        <p>Hello {{ $user->name }},</p>
        
        <p>Your reservation has reached its end time and requires verification.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Reservation Details:</h3>
            <p><strong>Title:</strong> {{ $reservation->title ?? 'Studio Reservation' }}</p>
            <p><strong>Date:</strong> {{ $reservation->day }}</p>
            <p><strong>End Time:</strong> {{ $reservation->end }}</p>
        </div>
        
        <p>Please verify that you have completed your reservation by clicking the link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://127.0.0.1:8000/{{ $verificationLink }}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Reservation Completion
            </a>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>
        LionsGeek Team</p>
    </div>
</body>
</html>

