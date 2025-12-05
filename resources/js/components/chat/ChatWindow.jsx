import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatWindow({ conversation, onBack }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [messages, setMessages] = useState(conversation.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversation.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/chat/conversation/${conversation.id}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                
                // Mark as read
                await fetch(`/chat/conversation/${conversation.id}/read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const messageBody = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const response = await fetch(`/chat/conversation/${conversation.id}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ body: messageBody }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, data.message]);
                // Refresh messages to get latest state
                setTimeout(() => fetchMessages(), 500);
            } else {
                // Restore message on error
                setNewMessage(messageBody);
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(messageBody);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const isCurrentUserMessage = (senderId) => {
        return String(senderId) === String(currentUser.id);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar
                    className="h-10 w-10"
                    image={conversation.other_user.image}
                    name={conversation.other_user.name}
                />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{conversation.other_user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conversation.other_user.email}</p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-4">
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message, index) => {
                            const isCurrentUser = isCurrentUserMessage(message.sender_id);
                            const showDate = index === 0 || 
                                new Date(message.created_at).toDateString() !== 
                                new Date(messages[index - 1].created_at).toDateString();

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {format(new Date(message.created_at), 'MMMM d, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    <div className={isCurrentUser ? "flex justify-end" : "flex justify-start"}>
                                        <div className={isCurrentUser 
                                            ? "max-w-[70%] bg-primary text-primary-foreground rounded-lg px-4 py-2" 
                                            : "max-w-[70%] bg-muted rounded-lg px-4 py-2"
                                        }>
                                            <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                                            <p className={`text-xs mt-1 ${
                                                isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                            }`}>
                                                {format(new Date(message.created_at), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t shrink-0">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

