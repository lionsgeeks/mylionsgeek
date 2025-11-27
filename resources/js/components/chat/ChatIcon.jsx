import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { router, usePage } from '@inertiajs/react';
import ConversationsList from './ConversationsList';

// Component dial chat icon - y7al chat w ybdl conversations
export default function ChatIcon() {
    const { unread_count } = usePage().props;
    const [unreadCount, setUnreadCount] = useState(unread_count || 0);
    const [isOpen, setIsOpen] = useState(false);
    const conversationsListRef = useRef(null);

    useEffect(() => {
        if (unread_count !== undefined) {
            setUnreadCount(unread_count);
        }
    }, [unread_count]);

    useEffect(() => {
        // Only fetch if we don't have it from props
        if (unread_count === undefined) {
            fetchUnreadCount();
        }
        
        // Tssma3 l event dial open chat dyal user specific
        const handleOpenChat = (event) => {
            const { userId } = event.detail;
            setIsOpen(true);
            setTimeout(() => {
                if (conversationsListRef.current && conversationsListRef.current.openConversationWithUser) {
                    conversationsListRef.current.openConversationWithUser(userId);
                }
            }, 100);
        };

        window.addEventListener('open-chat', handleOpenChat);
        
        return () => {
            window.removeEventListener('open-chat', handleOpenChat);
        };
    }, []);

    // Jib unread count via Inertia router
    const fetchUnreadCount = () => {
        router.visit('/chat/unread-count', {
            preserveState: true,
            preserveScroll: true,
            only: ['unread_count'],
            onSuccess: (page) => {
                setUnreadCount(page.props.unread_count || 0);
            },
        });
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
