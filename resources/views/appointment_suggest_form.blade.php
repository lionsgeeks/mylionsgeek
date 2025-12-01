<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Suggest another time</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background:#fafafa}
        .card{max-width:640px;margin:40px auto;padding:32px;border:1px solid rgba(0,0,0,.08);border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.05)}
        h1{font-size:22px;margin:0 0 12px}
        .muted{color:#6b7280;font-size:14px}
        label{display:block;margin:8px 0 6px;color:#374151;font-weight:500}
        input,textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;width:100%;background:#fff;box-sizing:border-box}
        input:focus,textarea:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.25)}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .btn{background:#2563eb;color:#fff;padding:10px 16px;border-radius:10px;border:none;cursor:pointer;transition:.2s ease;display:inline-flex;align-items:center;gap:8px;font-weight:500}
        .btn:hover{background:#1d4ed8}
        .btn-secondary{background:#6b7280}
        .btn-secondary:hover{background:#4b5563}
        .error{color:#e74c3c;font-size:14px;margin-top:4px}
    </style>
</head>
<body>
    <div class="card">
        <h1>Suggest another time</h1>
        <p class="muted">Original appointment: <strong>{{ $original_day }}</strong> from <strong>{{ $original_start }}</strong> to <strong>{{ $original_end }}</strong></p>
        <p class="muted">With: <strong>{{ $requester_name }}</strong></p>

        <form method="post" action="{{ route('appointments.suggest.submit', ['token' => $token]) }}">
            <?php echo csrf_field(); ?>
            <label>Date</label>
            <input type="date" name="day" required min="{{ date('Y-m-d') }}" />
            
            <div class="row">
                <div>
                    <label>Start Time</label>
                    <input type="time" name="start" required />
                </div>
                <div>
                    <label>End Time</label>
                    <input type="time" name="end" required />
                </div>
            </div>
            
            @if($errors->any())
                <div class="error">
                    @foreach($errors->all() as $error)
                        <p>{{ $error }}</p>
                    @endforeach
                </div>
            @endif
            
            <div style="margin-top:16px;display:flex;justify-content:end;gap:8px">
                <button class="btn btn-secondary" type="button" onclick="window.history.back()">Cancel</button>
                <button class="btn" type="submit">Send suggestion</button>
            </div>
        </form>
    </div>
</body>
</html>

