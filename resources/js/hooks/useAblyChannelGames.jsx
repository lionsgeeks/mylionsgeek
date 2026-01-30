import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

// Reusable hook for Ably channel subscriptions for games
// Uses games-specific Ably token endpoint - EXACTLY like useAblyChannel but for games
export default function useAblyChannelGames(channelName, events = ['game-state-updated', 'game-reset'], options = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const ablyRef = useRef(null);
    const channelRef = useRef(null);
    const callbacksRef = useRef(new Map());

    // Initialize Ably connection with games token endpoint
    const initializeAbly = useCallback(async () => {
        if (ablyRef.current) {
            return ablyRef.current;
        }

        try {
            // Get token from Laravel backend - games endpoint
            const response = await fetch('/api/games/ably-token', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to get Ably token:', response.status, errorText);
                throw new Error(`Failed to get Ably token: ${response.status} ${errorText}`);
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

    // Subscribe to channel events - EXACTLY like useAblyChannel
    useEffect(() => {
        let mounted = true;

        const setupChannel = async () => {
            const ably = await initializeAbly();
            if (!ably || !mounted) return;

            // Skip placeholder channels
            if (channelName === 'game:placeholder' || !channelName) {
                return;
            }

            try {
                //console.log('🔔 Setting up Ably channel:', channelName, 'Events:', events);
                const channel = ably.channels.get(channelName);
                channelRef.current = channel;

                // Subscribe to all specified events - EXACTLY like useAblyChannel
                events.forEach((eventName) => {
                    //console.log('📡 Subscribing to event:', eventName, 'on channel:', channelName);
                    channel.subscribe(eventName, (message) => {
                        //console.log('📨 Received message on', eventName, ':', message.data);
                        const callback = callbacksRef.current.get(eventName);
                        if (callback) {
                            //console.log('✅ Calling callback for', eventName);
                            try {
                                callback(message.data);
                            } catch (error) {
                                console.error('Error in Ably callback:', error);
                            }
                        } else {
                            console.warn('⚠️ No callback registered for', eventName);
                        }
                    });
                });

                //console.log('✅ Channel subscription active for:', channelName);
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
                // Unsubscribe from any other events that were registered
                callbacksRef.current.forEach((callback, eventName) => {
                    if (!events.includes(eventName)) {
                        channelRef.current.unsubscribe(eventName);
                    }
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

    // Subscribe to a specific event - EXACTLY like useAblyChannel
    const subscribe = useCallback((eventName, callback) => {
        //console.log('📝 Registering callback for event:', eventName, 'Channel ready:', !!channelRef.current);
        callbacksRef.current.set(eventName, callback);

        // If channel is already set up, subscribe immediately
        if (channelRef.current) {
            //console.log('✅ Channel ready, subscribing immediately to:', eventName);
            channelRef.current.subscribe(eventName, (message) => {
                //console.log('📨 Message received via immediate subscription:', eventName, message.data);
                callback(message.data);
            });
        } else {
            //console.log('⏳ Channel not ready yet, callback stored for later');
        }
        // If channel not set up yet, callback is stored in ref
        // It will be used when channel subscription is established in useEffect
    }, []);

    // Unsubscribe from a specific event
    const unsubscribe = useCallback((eventName) => {
        callbacksRef.current.delete(eventName);
        if (channelRef.current) {
            channelRef.current.unsubscribe(eventName);
        }
    }, []);

    // Publish a message to the channel
    const publish = useCallback(
        async (eventName, data) => {
            if (!channelRef.current) {
                const ably = await initializeAbly();
                if (!ably) {
                    throw new Error('Ably not initialized');
                }
                channelRef.current = ably.channels.get(channelName);
            }

            return channelRef.current.publish(eventName, data);
        },
        [channelName, initializeAbly],
    );

    return {
        isConnected,
        connectionError,
        channel: channelRef.current,
        subscribe,
        unsubscribe,
        publish,
    };
}
