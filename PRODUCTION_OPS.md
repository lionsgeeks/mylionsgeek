# Production ops checklist (mylionsgeek + lionsgeek-mobile)

Complete these on staging, then production, before calling the stack READY.

## 1. Database migrations

```bash
cd mylionsgeek
php artisan migrate --force
```

Required for chat reply/reactions:

- `2026_09_11_130000_add_reply_and_reactions_to_messages`

Verify:

```bash
php artisan migrate:status | grep 2026_09_11_130000
```

## 2. Queue worker

`.env` must use a durable queue (example: `QUEUE_CONNECTION=database`).

Run a supervised worker:

```bash
php artisan queue:work --sleep=1 --tries=3 --max-time=3600
```

Needed for: attendance slot reminders, newsletters, GeekLab certificates, and other `ShouldQueue` jobs.

## 3. Scheduler

Cron (every minute):

```cron
* * * * * cd /path/to/mylionsgeek && php artisan schedule:run >> /dev/null 2>&1
```

Covers: `reservations:check-end-times`, `attendance:send-slot-reminder`, `attendance:finalize-closed-slots`, `jobs:close-expired`.

## 4. Mobile EAS environment

Never bake a LAN IP into store builds. Set HTTPS secrets for production:

- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_EVENTS_INFO_SECTION_URL`
- `EXPO_PUBLIC_EVENTS_INFO_USE_PROXY=true`

Example:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_APP_URL --value https://api.example.com
eas build --platform all --profile production
```

Or add an `env` block under `build.production` in `eas.json` that references EAS env vars (no local `.env` values).

## 5. Smoke matrix

- [ ] Push tap opens the correct screen (chat thread / projects / reservations / events)
- [ ] Event notification → event detail
- [ ] Reservation notification mark-read succeeds (no 400)
- [ ] Studio reserve: double-tap does not create two rows; 422 shows Alert
- [ ] Kill network at cold start → stays logged in with cached user
- [ ] Mobile sends image → web can open attachment; web sends → mobile can open
- [ ] Reply + react persist after leaving and reopening the chat
- [ ] Overlapping equipment booking returns validation error

## 6. Re-audit

Re-run the production functional quality audit after the above.
