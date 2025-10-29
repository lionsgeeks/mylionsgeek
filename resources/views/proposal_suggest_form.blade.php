<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Suggest another time</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>
    <style>
        :root{--alpha: var(--color-alpha, #22d3ee)}
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:24px;color:#111;background:#fafafa}
        .card{max-width:980px;margin:40px auto;padding:24px;border:1px solid rgba(0,0,0,.08);border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.05)}
        h1{font-size:22px;margin:0 0 12px}
        .muted{color:#6b7280;font-size:14px}
        label{display:block;margin:8px 0 6px;color:#374151;font-weight:500}
        input{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;width:100%;background:#fff}
        input:focus{outline:none;border-color:var(--alpha);box-shadow:0 0 0 3px rgba(34,211,238,.25)}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .btn{background:var(--alpha);color:#111;padding:10px 16px;border-radius:10px;border:1px solid var(--alpha);cursor:pointer;transition:.2s ease;display:inline-flex;align-items:center;gap:8px}
        .btn:hover{background:transparent;color:var(--alpha)}
        #calendar{margin:18px 0;border:1px solid #e5e7eb;border-radius:12px;padding:8px}
        .toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
    </style>
</head>
<body>
    <div class="card">
        <div class="toolbar">
            <h1>Suggest another time</h1>
        </div>
        <p class="muted">Original proposal: <strong>{{ $proposed_day }}</strong> from <strong>{{ $proposed_start }}</strong> to <strong>{{ $proposed_end }}</strong></p>

        @if($place_type && $place_id)
            <div id="calendar"></div>
        @endif

        <form id="suggestForm" method="post" action="{{ route('reservations.proposal.suggest.submit', ['token' => $token]) }}">
            <?php echo csrf_field(); ?>
            <label>Date</label>
            <input id="inputDay" type="date" name="day" required />
            <div class="row">
                <div>
                    <label>Start</label>
                    <input id="inputStart" type="time" name="start" required />
                </div>
                <div>
                    <label>End</label>
                    <input id="inputEnd" type="time" name="end" required />
                </div>
            </div>
            <div style="margin-top:16px;display:flex;justify-content:end;gap:8px">
                <button class="btn" type="submit">Send suggestion</button>
            </div>
        </form>
    </div>

    @if($place_type && $place_id)
    <script>
        (function() {
            var el = document.getElementById('calendar');
            if (!el) return;

            var inputDay = document.getElementById('inputDay');
            var inputStart = document.getElementById('inputStart');
            var inputEnd = document.getElementById('inputEnd');

            var calendar = new FullCalendar.Calendar(el, {
                initialView: 'timeGridWeek',
                selectable: true,
                nowIndicator: true,
                height: 'auto',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: '{{ route('reservations.place.public', ['type' => $place_type, 'id' => $place_id]) }}',
                select: function(info) {
                    try {
                        var start = new Date(info.start);
                        var end = new Date(info.end);
                        var pad = n => String(n).padStart(2, '0');
                        var y = start.getFullYear();
                        var m = pad(start.getMonth()+1);
                        var d = pad(start.getDate());
                        inputDay.value = y+'-'+m+'-'+d;
                        inputStart.value = pad(start.getHours())+':'+pad(start.getMinutes());
                        inputEnd.value = pad(end.getHours())+':'+pad(end.getMinutes());
                    } catch (e) {}
                },
            });
            calendar.render();
        })();
    </script>
    @endif
</body>
</html>


