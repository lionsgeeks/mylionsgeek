<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Time Suggested</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background:#fafafa}
        .card{max-width:640px;margin:40px auto;padding:32px;border:1px solid rgba(0,0,0,.08);border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.05);text-align:center}
        h1{font-size:24px;margin:0 0 16px;color:#2563eb}
        .success-icon{font-size:48px;text-align:center;margin:16px 0}
        p{margin:12px 0;color:#555}
    </style>
</head>
<body>
    <div class="card">
        <div class="success-icon">✅</div>
        <h1>Time Suggested Successfully!</h1>
        <p>Your suggested time has been sent to <strong>{{ $requester_name }}</strong>.</p>
        <p>They will receive an email with your suggestion and can accept, decline, or suggest another time.</p>
    </div>
</body>
</html>

