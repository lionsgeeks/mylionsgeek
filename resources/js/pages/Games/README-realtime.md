Realtime rooms (tabs or cross-device)

What works now

- By default, rooms use BroadcastChannel so two tabs/windows on the same device can play together instantly. Share the same Room ID.

Enable cross-device (optional)

1. Provide a WebSocket endpoint and expose it as window.WS_URL (e.g. in your main layout before the app script):

```html
<script>
    window.WS_URL = 'wss://your-ws-server.example.com';
    // The server should forward messages to all clients in the same ?room=<id>
    // and broadcast plain JSON strings.
    // No auth required for basic testing.
    // Clients send messages like: { type: 'hello' | 'state' | 'move' | ... }
    // The server just relays to everyone else in that room.
    // For production, add auth and rate-limiting.
    // If WS_URL is not set, the app falls back to BroadcastChannel.
</script>
```

2. Any simple relay server works. For example, a Node ws relay that groups by room and broadcasts to all in the room.

Usage in UI

- Enter your name and a Room ID (or click Generate) and click Join Room.
- Share the same Room ID with your friend on their device/browser.
- When a room is connected, moves/states sync in realtime.
