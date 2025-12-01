<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Appointment Approved</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background-color:#f9f9f9} .card{max-width:640px;margin:40px auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background-color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.05)} h1{font-size:24px;margin:0 0 16px;color:#27ae60} .success-icon{font-size:48px;text-align:center;margin:16px 0} .details{background-color:#e8f5e8;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #27ae60} .details p{margin:8px 0} p{margin:12px 0;color:#555}</style>
</head>
<body>
    <div class="card">
        <div class="success-icon">✅</div>
        <h1>Appointment Approved!</h1>
        <p>You have successfully approved the appointment request.</p>
        
        <div class="details">
            <p><strong>Requester:</strong> {{ $requester_name }}</p>
            <p><strong>Date:</strong> {{ $day }}</p>
            <p><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>
        
        <p style="margin-top:24px;color:#555;">An email confirmation has been sent to the requester. Thank you!</p>
    </div>
</body>
</html>

