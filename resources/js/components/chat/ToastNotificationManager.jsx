// Toast notification manager - manages multiple toast notifications
// Manager dial toast notifications bach n3mlo queue dial notifications

import React, { useCallback, useRef, useState } from 'react';
import ToastNotification from './ToastNotification';

const MAX_TOASTS = 3;

export default function ToastNotificationManager() {
    const [notifications, setNotifications] = useState([]);
    const shownMessageIdsRef = useRef(new Set());

    // Add notification with deduplication
    const addNotification = useCallback((notification) => {
        // Create unique key for deduplication (message ID or conversation + timestamp)
        const messageId = notification.messageId || `${notification.conversationId}-${notification.userId}-${Date.now()}`;

        // Skip if already shown
        if (shownMessageIdsRef.current.has(messageId)) {
            return null;
        }

        shownMessageIdsRef.current.add(messageId);
        const id = Date.now() + Math.random();
        const newNotification = { ...notification, id, messageId };

        setNotifications((prev) => {
            const updated = [...prev, newNotification];
            // Keep only last MAX_TOASTS notifications
            return updated.slice(-MAX_TOASTS);
        });

        // Clean up message ID after 30 seconds to allow re-notification if needed
        setTimeout(() => {
            shownMessageIdsRef.current.delete(messageId);
        }, 30000);

        return id;
    }, []);

    // Remove notification
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Handle notification click
    const handleNotificationClick = useCallback(
        (notification) => {
            // Dispatch event to open chat
            if (notification.conversationId) {
                window.dispatchEvent(
                    new CustomEvent('open-chat', {
                        detail: { userId: notification.userId || notification.sender?.id },
                    }),
                );
            }
            removeNotification(notification.id);
        },
        [removeNotification],
    );

    // Expose addNotification globally
    React.useEffect(() => {
        window.showChatToast = addNotification;
        return () => {
            delete window.showChatToast;
        };
    }, [addNotification]);

    return (
        <div className="pointer-events-none fixed top-4 right-4 z-[9998]" style={{ maxWidth: '400px' }}>
            <div className="flex flex-col gap-2">
                {notifications.map((notification) => (
                    <div key={notification.id} className="pointer-events-auto">
                        <ToastNotification
                            notification={notification}
                            onClose={() => removeNotification(notification.id)}
                            onClick={() => handleNotificationClick(notification)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
