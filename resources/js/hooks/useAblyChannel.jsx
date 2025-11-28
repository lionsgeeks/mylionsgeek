import { useEffect, useRef, useState, useCallback } from 'react';
import * as Ably from 'ably';

// Reusable hook for Ably channel subscriptions
// Hook bach nst3mlo f ay component bach ntsma3o 3la Ably channels
export default function useAblyChannel(channelName, events = ['new-message'], options = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const ablyRef = useRef(null);
    const channelRef = useRef(null);
    const callbacksRef = useRef(new Map());

    // Initialize Ably connection
    const initializeAbly = useCallback(async () => {
        if (ablyRef.current) {
            return ablyRef.current;
        }

        try {
            // Get token from Laravel backend
            const response = await fetch('/chat/ably-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to get Ably token');
            }

            const data = await response.json();
            
            // Initialize Ably with token
            const ably = new Ably.Realtime({
                token: data.token,
                clientId: data.clientId,
            });

            // Connection event handlers
            ably.connection.on('connected', () => {
                setIsConnected(true);
                setConnectionError(null);
                if (options.onConnected) {
                    options.onConnected();
                }
            });

            ably.connection.on('disconnected', () => {
                setIsConnected(false);
                if (options.onDisconnected) {
                    options.onDisconnected();
                }
            });

            ably.connection.on('failed', (error) => {
                setIsConnected(false);
                setConnectionError(error);
                if (options.onError) {
                    options.onError(error);
                }
            });

            ablyRef.current = ably;
            return ably;
        } catch (error) {
            console.error('Error initializing Ably:', error);
            setConnectionError(error);
            if (options.onError) {
                options.onError(error);
            }
            return null;
        }
    }, [options]);

    // Subscribe to channel events
    useEffect(() => {
        let mounted = true;

        const setupChannel = async () => {
            const ably = await initializeAbly();
            if (!ably || !mounted) return;

            try {
                const channel = ably.channels.get(channelName);
                channelRef.current = channel;

                // Subscribe to all specified events
                events.forEach((eventName) => {
                    channel.subscribe(eventName, (message) => {
                        const callback = callbacksRef.current.get(eventName);
                        if (callback) {
                            callback(message.data);
                        }
                    });
                });

                if (options.onSubscribed) {
                    options.onSubscribed(channel);
                }
            } catch (error) {
                console.error('Error setting up channel:', error);
                setConnectionError(error);
                if (options.onError) {
                    options.onError(error);
                }
            }
        };

        setupChannel();

        return () => {
            mounted = false;
            if (channelRef.current) {
                events.forEach((eventName) => {
                    channelRef.current.unsubscribe(eventName);
                });
                channelRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName, events.join(',')]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (ablyRef.current) {
                ablyRef.current.close();
                ablyRef.current = null;
            }
        };
    }, []);

    // Subscribe to a specific event
    const subscribe = useCallback((eventName, callback) => {
        callbacksRef.current.set(eventName, callback);
        
        // If channel is already set up, subscribe immediately
        if (channelRef.current) {
            channelRef.current.subscribe(eventName, (message) => {
                callback(message.data);
            });
        }
    }, []);

    // Unsubscribe from a specific event
    const unsubscribe = useCallback((eventName) => {
        callbacksRef.current.delete(eventName);
        if (channelRef.current) {
            channelRef.current.unsubscribe(eventName);
        }
    }, []);

    // Publish a message to the channel
    const publish = useCallback(async (eventName, data) => {
        if (!channelRef.current) {
            const ably = await initializeAbly();
            if (!ably) {
                throw new Error('Ably not initialized');
            }
            channelRef.current = ably.channels.get(channelName);
        }

        return channelRef.current.publish(eventName, data);
    }, [channelName, initializeAbly]);

    return {
        isConnected,
        connectionError,
        channel: channelRef.current,
        subscribe,
        unsubscribe,
        publish,
    };
}
