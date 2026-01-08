// Singleton Ably manager for multiple channel subscriptions
// Manager dial Ably bach nst3mlo f kol components bach n3mlo subscriptions dial channels

import * as Ably from 'ably';

let ablyInstance = null;
const channelSubscriptions = new Map();
const channelCallbacks = new Map();

// Initialize Ably instance
export const initializeAbly = async () => {
    if (ablyInstance) {
        return ablyInstance;
    }

    try {
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
        
        ablyInstance = new Ably.Realtime({
            token: data.token,
            clientId: data.clientId,
        });

        ablyInstance.connection.on('connected', () => {
            //console.log('Ably connected globally');
        });

        ablyInstance.connection.on('disconnected', () => {
            //console.log('Ably disconnected');
        });

        ablyInstance.connection.on('failed', (error) => {
            console.error('Ably connection failed:', error);
        });

        return ablyInstance;
    } catch (error) {
        console.error('Error initializing Ably:', error);
        return null;
    }
};

// Subscribe to a channel event
export const subscribeToChannel = async (channelName, eventName, callback) => {
    const ably = await initializeAbly();
    if (!ably) return null;

    try {
        const key = `${channelName}:${eventName}`;
        
        // Store callback
        if (!channelCallbacks.has(key)) {
            channelCallbacks.set(key, new Set());
        }
        channelCallbacks.get(key).add(callback);

        // Get or create channel
        if (!channelSubscriptions.has(channelName)) {
            const channel = ably.channels.get(channelName);
            
            // Subscribe to event and forward to all callbacks
            channel.subscribe(eventName, (message) => {
                const callbacks = channelCallbacks.get(key);
                if (callbacks) {
                    callbacks.forEach(cb => {
                        try {
                            cb(message.data);
                        } catch (error) {
                            console.error('Error in Ably callback:', error);
                        }
                    });
                }
            });

            channelSubscriptions.set(channelName, channel);
        }

        return () => unsubscribeFromChannel(channelName, eventName, callback);
    } catch (error) {
        console.error('Error subscribing to channel:', error);
        return null;
    }
};

// Unsubscribe from a channel event
export const unsubscribeFromChannel = (channelName, eventName, callback) => {
    const key = `${channelName}:${eventName}`;
    const callbacks = channelCallbacks.get(key);
    
    if (callbacks) {
        callbacks.delete(callback);
        
        // If no more callbacks, unsubscribe from event
        if (callbacks.size === 0) {
            channelCallbacks.delete(key);
            const channel = channelSubscriptions.get(channelName);
            
            if (channel) {
                channel.unsubscribe(eventName);
                
                // If channel has no subscriptions, remove it
                const hasSubscriptions = Array.from(channelCallbacks.keys()).some(k => k.startsWith(`${channelName}:`));
                if (!hasSubscriptions) {
                    channelSubscriptions.delete(channelName);
                }
            }
        }
    }
};

// Publish message to channel
export const publishToChannel = async (channelName, eventName, data) => {
    const ably = await initializeAbly();
    if (!ably) return null;

    try {
        let channel = channelSubscriptions.get(channelName);
        
        // If channel doesn't exist, create it
        if (!channel) {
            channel = ably.channels.get(channelName);
            channelSubscriptions.set(channelName, channel);
        }

        await channel.publish(eventName, data);
        return true;
    } catch (error) {
        console.error('Error publishing to channel:', error);
        return false;
    }
};

// Close all connections
export const closeAbly = () => {
    if (ablyInstance) {
        ablyInstance.close();
        ablyInstance = null;
    }
    channelSubscriptions.clear();
    channelCallbacks.clear();
};

