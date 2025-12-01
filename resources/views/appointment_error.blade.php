<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background-color:#f9f9f9} .card{max-width:640px;margin:40px auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background-color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.05)} h1{font-size:24px;margin:0 0 16px;color:#e74c3c} p{margin:12px 0;color:#555}</style>
</head>
<body>
    <div class="card">
        <h1>Error</h1>
        <p>{{ $message ?? 'An error occurred while processing your request. Please try again or contact support.' }}</p>
    </div>
</body>
</html>

