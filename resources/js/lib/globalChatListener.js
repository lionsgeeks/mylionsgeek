// Global chat message listener - listens to all conversations for toast notifications
// Listener dial global bach ntsma3o 3la kol conversations w n3tiw toast notifications

import { subscribeToChannel, unsubscribeFromChannel } from './ablyManager';
import { showDesktopNotification, hasNotificationPermission, requestNotificationPermission } from './notificationManager';

let globalSubscriptions = new Map();
let currentUserId = null;

// Initialize global listener with user ID
export const initializeGlobalChatListener = (userId) => {
    currentUserId = userId;
    
    // Request notification permission
    requestNotificationPermission();
};

// Subscribe to a conversation for global notifications
export const subscribeToConversationForNotifications = async (conversationId, conversationData) => {
    // Don't subscribe if already subscribed
    if (globalSubscriptions.has(conversationId)) {
        return;
    }

    const channelName = `chat:conversation:${conversationId}`;
    
    const handleNewMessage = (messageData) => {
        // Only show notification for messages from other users
        if (!currentUserId || messageData.sender_id === currentUserId) {
            return;
        }

        // Show toast notification unconditionally
        if (window.showChatToast) {
            window.showChatToast({
                sender: messageData.sender || conversationData?.other_user || {
                    id: messageData.sender_id,
                    name: '',
                    image: '',
                },
                body: messageData.body,
                attachment_type: messageData.attachment_type,
                conversationId: conversationId,
                userId: messageData.sender_id,
                messageId: messageData.id, // For deduplication
            });
        }

        // Show desktop notification if permission granted
        if (hasNotificationPermission() && (document.hidden || !document.hasFocus())) {
            const sender = messageData.sender || conversationData?.other_user || {
                id: messageData.sender_id,
                name: '',
                image: '',
            };
            
            showDesktopNotification(
                sender.name || 'New message',
                {
                    body: messageData.body || '📎 Attachment',
                    icon: sender.image ? `/storage/img/profile/${sender.image}` : '/favicon.ico',
                    tag: `chat-${conversationId}`,
                    data: {
                        conversationId: conversationId,
                        userId: messageData.sender_id,
                    },
                }
            );
        }
    };

    // Subscribe to new messages
    subscribeToChannel(channelName, 'new-message', handleNewMessage).then(unsub => {
        if (unsub) {
            globalSubscriptions.set(conversationId, { unsubscribe: unsub, handler: handleNewMessage });
        }
    });
};

// Unsubscribe from a conversation
export const unsubscribeFromConversationNotifications = (conversationId) => {
    const subscription = globalSubscriptions.get(conversationId);
    if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        globalSubscriptions.delete(conversationId);
    }
};

// Unsubscribe from all conversations
export const clearAllGlobalSubscriptions = () => {
    globalSubscriptions.forEach((subscription) => {
        if (subscription.unsubscribe) {
            subscription.unsubscribe();
        }
    });
    globalSubscriptions.clear();
};

