import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import useAblyChannel from '@/hooks/useAblyChannel';

const Chat = ({ projectId, messages: initialMessages = [] }) => {
    const page = usePage();
    const { auth } = page.props;
    const [chatOpen, setChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages);
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Subscribe to real-time messages via Ably
    const channelName = projectId ? `project:${projectId}` : null;
    
    const { isConnected, subscribe } = useAblyChannel(
        channelName || 'project:placeholder',
        ['new-message'],
        {
            onConnected: () => {
                if (projectId) {
                    console.log('✅ Connected to project chat channel:', channelName);
                }
            },
            onError: (error) => {
                console.error('❌ Ably connection error:', error);
            },
        }
    );

    // Fetch initial messages
    useEffect(() => {
        if (projectId) {
            fetch(`/admin/projects/${projectId}/messages`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.messages) {
                        setMessages(data.messages);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch messages:', error);
                });
        }
    }, [projectId]);

    // Subscribe to new messages - register callback immediately
    useEffect(() => {
        if (!subscribe || !projectId) return;

        const handleNewMessage = (data) => {
            console.log('📨 Received new message via Ably:', data);
            // Check if message already exists to prevent duplicates
            setMessages((prev) => {
                const exists = prev.some(msg => msg.id === data.id);
                if (exists) {
                    console.log('⚠️ Duplicate message detected, skipping');
                    return prev;
                }
                console.log('✅ Adding new message to chat');
                return [...prev, data];
            });
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        // Register the callback - this will work even if channel isn't ready yet
        subscribe('new-message', handleNewMessage);

        // Cleanup
        return () => {
            // The hook handles cleanup, but we can add additional cleanup if needed
        };
    }, [subscribe, projectId]);

    // Auto-scroll to bottom when chat opens or messages change
    useEffect(() => {
        if (chatOpen && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [chatOpen, messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !projectId || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Don't add message here - it will be received via Ably broadcast
            // This prevents duplicate messages
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setNewMessage(content);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4">
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="lg:h-screen lg:w-1/4 p-4">
                    <SheetHeader>
                        <SheetTitle>Team Chat</SheetTitle>
                        <SheetDescription>Chat with your team members</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 mt-4 mb-4 lg:h-[calc(60vh-180px)]" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className="flex gap-3">
                                        <Avatar
                                            className="h-8 w-8"
                                            image={message.user.avatar}
                                            name={message.user.name}
                                            onlineCircleClass="hidden"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-medium text-sm">{message.user.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(message.timestamp).toLocaleTimeString(undefined, {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <div className="rounded-md bg-muted p-2 text-sm">{message.content}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                    <SheetFooter className="flex-row gap-2">
                        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                            <Input
                                placeholder="Type something..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={isSending || !newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Chat;
