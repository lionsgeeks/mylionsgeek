// Lightweight realtime adapter.
// - Uses BroadcastChannel for same-device/tab play (no server required)
// - Optionally uses WebSocket if window.WS_URL is provided for cross-device

export function createRealtime(roomId, onMessage) {
    const channelName = `realtime-${roomId}`;
    let bc = null;
    let ws = null;
    let connected = false;

    const safeParse = (data) => {
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    };

    const notify = (msg) => {
        if (typeof onMessage === 'function') onMessage(msg);
    };

    // BroadcastChannel transport (always available for tabs in same device)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(channelName);
        bc.onmessage = (ev) => {
            // //////console.log('[Realtime] BroadcastChannel received message:', channelName, ev.data);
            if (ev && ev.data) {
                notify(ev.data);
            } else {
                console.warn('[Realtime] Received message with no data:', ev);
            }
        };
        bc.onmessageerror = (ev) => {
            console.error('[Realtime] BroadcastChannel message error:', ev);
        };
        connected = true;
        // //////console.log('[Realtime] BroadcastChannel created for room:', channelName);
    } else {
        console.warn('[Realtime] BroadcastChannel not available');
    }

    // Optional WebSocket transport for cross-device/browser
    if (typeof window !== 'undefined' && window.WS_URL) {
        try {
            ws = new WebSocket(`${window.WS_URL}?room=${encodeURIComponent(roomId)}`);
            ws.onopen = () => {
                connected = true;
            };
            ws.onmessage = (ev) => {
                const parsed = safeParse(ev.data);
                if (parsed) notify(parsed);
            };
            ws.onerror = () => {
                /* noop */
            };
        } catch {
            // ignore ws errors; BroadcastChannel still works locally
        }
    }

    const send = (msg) => {
        const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);

        // Debug log (commented out)
        // //////console.log('[Realtime] Sending message:', msg.type, {
        //     bc: !!bc,
        //     ws: ws?.readyState === 1,
        //     channelName,
        //     msgData: msg
        // });

        if (bc) {
            try {
                bc.postMessage(msg); // BroadcastChannel can send objects directly
            } catch (error) {
                console.error('[Realtime] Error posting to BroadcastChannel:', error);
            }
        } else {
            console.warn('[Realtime] No BroadcastChannel available to send');
        }

        if (ws && ws.readyState === 1) {
            ws.send(payload);
        }
    };

    const leave = () => {
        if (bc) {
            bc.close();
            bc = null;
        }
        if (ws) {
            try {
                ws.close();
            } catch {
                /* ignore */
            }
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
