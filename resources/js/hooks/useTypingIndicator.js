// Hook for typing indicator - real-time typing status
// Hook bach n3rfo ila user kaykteb wla la

import { publishToChannel, subscribeToChannel, unsubscribeFromChannel } from '@/lib/ablyManager';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useTypingIndicator = (channelName, currentUserId, isActive = true) => {
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    // Stop typing event
    const stopTyping = useCallback(() => {
        if (!isActive || !isTypingRef.current) return;

        isTypingRef.current = false;
        publishToChannel(channelName, 'typing', {
            user_id: currentUserId,
            is_typing: false,
        }).catch((err) => console.error('Failed to publish stop typing:', err));

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [channelName, currentUserId, isActive]);

    // Publish typing event
    const startTyping = useCallback(() => {
        if (!isActive) return;

        // Don't check isTypingRef - always publish (handles rapid typing)
        isTypingRef.current = true;

        // Publish typing event via Ably
        publishToChannel(channelName, 'typing', {
            user_id: currentUserId,
            is_typing: true,
        }).catch((err) => console.error('Failed to publish typing:', err));

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                stopTyping();
            }
        }, 3000);
    }, [channelName, currentUserId, isActive, stopTyping]);

    // Subscribe to typing events
    useEffect(() => {
        if (!isActive) return;

        const handleTyping = (data) => {
            // Ignore own typing events
            if (data.user_id === currentUserId) return;

            setTypingUsers((prev) => {
                const newSet = new Set(prev);

                if (data.is_typing) {
                    newSet.add(data.user_id);
                    // Auto-remove after 3 seconds
                    setTimeout(() => {
                        setTypingUsers((prevSet) => {
                            const updated = new Set(prevSet);
                            updated.delete(data.user_id);
                            return updated;
                        });
                    }, 3000);
                } else {
                    newSet.delete(data.user_id);
                }

                return newSet;
            });
        };

        subscribeToChannel(channelName, 'typing', handleTyping);

        return () => {
            stopTyping();
            unsubscribeFromChannel(channelName, 'typing', handleTyping);
        };
    }, [channelName, currentUserId, isActive, stopTyping]);

    return {
        typingUsers: Array.from(typingUsers),
        startTyping,
        stopTyping,
        isTyping: typingUsers.size > 0,
    };
};
