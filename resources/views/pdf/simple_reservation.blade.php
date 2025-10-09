<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reservation PDF</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; color: #111; }
        h1 { font-size: 20px; margin: 0 0 8px; }
        .meta { margin: 6px 0; }
        .label { color: #666; width: 140px; display: inline-block; }
        .value { color: #111; }
        .box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Reservation #{{ $reservation['id'] }}</h1>
    <div class="meta"><span class="label">User</span> <span class="value">{{ $reservation['user_name'] ?? '—' }}</span></div>
    <div class="meta"><span class="label">Title</span> <span class="value">{{ $reservation['title'] ?? '—' }}</span></div>
    <div class="meta"><span class="label">Type</span> <span class="value">{{ $reservation['type'] ?? '—' }}</span></div>
    <div class="meta"><span class="label">Date</span> <span class="value">{{ $reservation['date'] ?? '—' }}</span></div>
    <div class="meta"><span class="label">Time</span> <span class="value">{{ ($reservation['start'] ?? '—') . ' - ' . ($reservation['end'] ?? '—') }}</span></div>
    <div class="meta"><span class="label">Approved</span> <span class="value">{{ ($reservation['approved'] ?? false) ? 'Yes' : 'No' }}</span></div>
    @if(!empty($reservation['description']))
    <div class="box">
        <strong>Description</strong>
        <div>{{ $reservation['description'] }}</div>
    </div>
    @endif
</body>
</html>


