<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Appointment Canceled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background-color:#f9f9f9} .card{max-width:640px;margin:40px auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background-color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.05)} h1{font-size:24px;margin:0 0 16px;color:#e74c3c} .cancel-icon{font-size:48px;text-align:center;margin:16px 0} .details{background-color:#fee;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #e74c3c} .details p{margin:8px 0} p{margin:12px 0;color:#555}</style>
</head>
<body>
    <div class="card">
        <div class="cancel-icon">❌</div>
        <h1>Appointment Canceled</h1>
        <p>You have canceled the appointment request.</p>
        
        <div class="details">
            <p><strong>Requester:</strong> {{ $requester_name }}</p>
            <p><strong>Date:</strong> {{ $day }}</p>
            <p><strong>Time:</strong> {{ $start }} - {{ $end }}</p>
        </div>
        
        <p style="margin-top:24px;color:#555;">A cancellation notification has been sent to the requester.</p>
    </div>
</body>
</html>

