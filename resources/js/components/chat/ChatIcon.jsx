import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { subscribeToChannel, unsubscribeFromChannel } from '@/lib/ablyManager';
import { initializeGlobalChatListener, subscribeToConversationForNotifications, unsubscribeFromConversationNotifications } from '@/lib/globalChatListener';
import ConversationsList from './ConversationsList';

// Component dial chat icon - y7al chat w ybdl conversations
export default function ChatIcon() {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const conversationsListRef = useRef(null);
    const conversationIdsRef = useRef([]);

    useEffect(() => {
        fetchUnreadCount();
        
        // Initialize global chat listener for toast notifications
        initializeGlobalChatListener(currentUser.id);
        
        // Listen to open-chat event for specific user
        const handleOpenChat = (event) => {
            const { userId } = event.detail;
            setIsOpen(true);
            setTimeout(() => {
                if (conversationsListRef.current?.openConversationWithUser) {
                    conversationsListRef.current.openConversationWithUser(userId);
                }
            }, 100);
        };

        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [currentUser.id]);

    // Real-time unread count updates + global toast notifications
    useEffect(() => {
        // Fetch conversations to get all conversation IDs
        const fetchConversationsForRealTime = async () => {
            try {
                const response = await fetch('/chat', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Failed to fetch conversations:', errorData);
                    return;
                }

                const data = await response.json();
                const conversations = data.conversations || [];
                conversationIdsRef.current = conversations.map(c => c.id);

                // Subscribe to all conversations for global notifications
                conversations.forEach((conversation) => {
                    subscribeToConversationForNotifications(conversation.id, conversation);
                    
                    // Also subscribe for unread count updates
                    const channelName = `chat:conversation:${conversation.id}`;
                    const handleNewMessage = (messageData) => {
                        if (messageData.sender_id !== currentUser.id) {
                            setUnreadCount(prev => prev + 1);
                        }
                    };
                    
                    subscribeToChannel(channelName, 'new-message', handleNewMessage);
                });

                // Cleanup
                return () => {
                    conversations.forEach((conversation) => {
                        unsubscribeFromConversationNotifications(conversation.id);
                    });
                };
            } catch (error) {
                console.error('Failed to setup real-time notifications:', error);
            }
        };

        fetchConversationsForRealTime();
    }, [currentUser.id]);

    // Fetch unread count b fetch
    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/chat/unread-count', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            fetchUnreadCount();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-9 w-9 rounded-md"
                    aria-label="Chat"
                >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-white dark:border-dark">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent 
                className="!w-[95vw] !h-[95vh] !max-w-none !max-h-none p-0 gap-0 rounded-xl overflow-hidden shadow-2xl border-2 md:!w-[70vw] md:!h-[90vh] md:!max-w-[70vw] md:!max-h-[90vh] !grid !grid-rows-1"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Messages</DialogTitle>
                <ConversationsList 
                    ref={conversationsListRef}
                    onCloseChat={() => setIsOpen(false)}
                    onUnreadCountChange={setUnreadCount}
                />
            </DialogContent>
        </Dialog>
    );
}
