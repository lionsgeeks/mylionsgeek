import axios from 'axios';
import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL_MS = 60_000;

export default function PresenceHeartbeat({ userId }) {
    const normalizedUserId = userId != null ? String(userId) : null;
    const intervalIdRef = useRef(null);

    useEffect(() => {
        if (!normalizedUserId) return undefined;

        const ping = async () => {
            try {
                await axios.post('/presence/ping');
            } catch {
                // Intentionally ignore: presence heartbeat should never break UI.
            }
        };

        const tick = () => {
            if (document.visibilityState === 'visible') {
                void ping();
            }
        };

        tick();
        const onVisibilityChange = () => tick();
        document.addEventListener('visibilitychange', onVisibilityChange);

        intervalIdRef.current = window.setInterval(tick, HEARTBEAT_INTERVAL_MS);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (intervalIdRef.current != null) {
                window.clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [normalizedUserId]);

    return null;
}

