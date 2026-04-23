import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initializeAbly } from '@/lib/ablyManager';

const OnlineUsersContext = createContext(null);
const PRESENCE_CHANNEL_NAME = 'presence:global';
const PRESENCE_UPDATE_INTERVAL_MS = 30_000;
const PRESENCE_PRUNE_INTERVAL_MS = 10_000;
const PRESENCE_STALE_AFTER_MS = 70_000;

export function OnlineUsersProvider({ children, userId }) {
    const normalizedUserId = userId != null ? String(userId) : null;

    const [onlineUserIds, setOnlineUserIds] = useState(new Set());
    const channelRef = useRef(null);
    const lastSeenByUserIdRef = useRef(new Map());

    useEffect(() => {
        if (!normalizedUserId) return undefined;

        let cancelled = false;
        let cleanupPresence;
        let updateIntervalId;
        let pruneIntervalId;

        const pingLastOnline = async () => {
            try {
                await axios.post('/presence/ping');
            } catch {
                // Ignore: presence should never break UI.
            }
        };

        const markSeenNow = (id) => {
            lastSeenByUserIdRef.current.set(String(id), Date.now());
        };

        const pruneStaleMembers = () => {
            const nowMs = Date.now();
            setOnlineUserIds((prev) => {
                if (prev.size === 0) return prev;

                let changed = false;
                const next = new Set(prev);
                for (const id of prev) {
                    const lastSeenMs = lastSeenByUserIdRef.current.get(id);
                    if (!lastSeenMs || nowMs - lastSeenMs > PRESENCE_STALE_AFTER_MS) {
                        next.delete(id);
                        lastSeenByUserIdRef.current.delete(id);
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        };

        const run = async () => {
            const ably = await initializeAbly();
            if (!ably || cancelled) return;

            const channel = ably.channels.get(PRESENCE_CHANNEL_NAME);
            channelRef.current = channel;

            // Enter presence for current user.
            try {
                await channel.presence.enter({ user_id: normalizedUserId });
                markSeenNow(normalizedUserId);
                void pingLastOnline();
            } catch {
                // Ignore: if presence enter fails, fallback is last_online timestamps.
            }

            // Seed initial members.
            try {
                const members = await channel.presence.get();
                if (!cancelled) {
                    members.forEach((m) => markSeenNow(m.clientId));
                    setOnlineUserIds(new Set(members.map((m) => String(m.clientId))));
                }
            } catch {
                // Ignore
            }

            const handlePresenceMessage = (msg) => {
                if (cancelled) return;

                const id = String(msg.clientId);
                if (msg.action === 'enter' || msg.action === 'present' || msg.action === 'update') {
                    markSeenNow(id);
                }
                setOnlineUserIds((prev) => {
                    const next = new Set(prev);
                    if (msg.action === 'enter' || msg.action === 'present' || msg.action === 'update') {
                        next.add(id);
                    } else if (msg.action === 'leave') {
                        next.delete(id);
                        lastSeenByUserIdRef.current.delete(id);
                    }
                    return next;
                });

                if (id === normalizedUserId && (msg.action === 'enter' || msg.action === 'present' || msg.action === 'update')) {
                    void pingLastOnline();
                }
            };

            channel.presence.subscribe(handlePresenceMessage);

            const sendPresenceUpdate = () => {
                if (document.visibilityState !== 'visible') return;
                channel.presence
                    .update({ user_id: normalizedUserId, t: Date.now() })
                    .then(() => {
                        markSeenNow(normalizedUserId);
                    })
                    .catch(() => {});
            };

            // Keep our presence fresh (helps other clients expire us quickly after tab close).
            updateIntervalId = window.setInterval(sendPresenceUpdate, PRESENCE_UPDATE_INTERVAL_MS);
            // Expire members locally even if Ably leave is delayed.
            pruneIntervalId = window.setInterval(pruneStaleMembers, PRESENCE_PRUNE_INTERVAL_MS);

            const onVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    channel.presence.enter({ user_id: normalizedUserId }).catch(() => {});
                    sendPresenceUpdate();
                    void pingLastOnline();
                }
            };
            document.addEventListener('visibilitychange', onVisibilityChange);

            cleanupPresence = () => {
                document.removeEventListener('visibilitychange', onVisibilityChange);
                channel.presence.unsubscribe(handlePresenceMessage);
                if (updateIntervalId) window.clearInterval(updateIntervalId);
                if (pruneIntervalId) window.clearInterval(pruneIntervalId);
            };
        };

        void run();

        return () => {
            cancelled = true;
            try {
                cleanupPresence?.();
            } catch {
                // ignore
            }
            try {
                channelRef.current?.presence.leave();
            } catch {
                // ignore
            }
            channelRef.current = null;
            lastSeenByUserIdRef.current = new Map();
            setOnlineUserIds(new Set());
        };
    }, [normalizedUserId]);

    const value = useMemo(() => ({ onlineUserIds }), [onlineUserIds]);

    return <OnlineUsersContext.Provider value={value}>{children}</OnlineUsersContext.Provider>;
}

export function useOnlineUsers() {
    const ctx = useContext(OnlineUsersContext);
    if (!ctx) return { onlineUserIds: new Set() };
    return ctx;
}

