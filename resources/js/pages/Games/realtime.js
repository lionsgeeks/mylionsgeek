// Lightweight realtime adapter.
// - Uses BroadcastChannel for same-device/tab play (no server required)
// - Optionally uses WebSocket if window.WS_URL is provided for cross-device

export function createRealtime(roomId, onMessage) {
    const channelName = `realtime-${roomId}`;
    let bc = null;
    let ws = null;
    let connected = false;

    const safeParse = (data) => {
        try { return JSON.parse(data); } catch { return null; }
    };

    const notify = (msg) => {
        if (typeof onMessage === 'function') onMessage(msg);
    };

    // BroadcastChannel transport (always available for tabs in same device)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(channelName);
        bc.onmessage = (ev) => {
            notify(ev.data);
        };
        connected = true;
    }

    // Optional WebSocket transport for cross-device/browser
    if (typeof window !== 'undefined' && window.WS_URL) {
        try {
            ws = new WebSocket(`${window.WS_URL}?room=${encodeURIComponent(roomId)}`);
            ws.onopen = () => { connected = true; };
            ws.onmessage = (ev) => {
                const parsed = safeParse(ev.data);
                if (parsed) notify(parsed);
            };
            ws.onerror = () => { /* noop to satisfy no-empty */ };
        } catch {
            // ignore ws errors; BroadcastChannel still works locally
        }
    }

    const send = (msg) => {
        const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
        if (bc) bc.postMessage(msg);
        if (ws && ws.readyState === 1) ws.send(payload);
    };

    const leave = () => {
        if (bc) {
            bc.close();
            bc = null;
        }
        if (ws) {
            try { ws.close(); } catch { /* ignore */ }
            ws = null;
        }
        connected = false;
    };

    return {
        send,
        leave,
        isConnected: () => connected,
    };
}

export function randomRoomId(prefix = 'room') {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${rnd}`;
}


