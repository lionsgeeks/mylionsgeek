import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ConversationsList from './ConversationsList';

// Component dial chat icon - y7al chat w ybdl conversations
export default function ChatIcon() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const conversationsListRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        
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
    }, []);

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
                className="w-full h-full max-w-none max-h-none p-0 gap-0 m-0 rounded-none translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%] overflow-hidden shadow-2xl border-2 md:!w-[70vw] md:!h-[90vh] md:!max-w-[70vw] md:!max-h-[90vh] md:rounded-xl md:translate-x-[-50%] md:translate-y-[-50%] md:top-[50%] md:left-[50%] !grid-rows-none"
                showCloseButton={false}
            >
                <ConversationsList 
                    ref={conversationsListRef}
                    onCloseChat={() => setIsOpen(false)}
                    onUnreadCountChange={setUnreadCount}
                />
            </DialogContent>
        </Dialog>
    );
}
