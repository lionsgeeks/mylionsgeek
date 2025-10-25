import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';

const Chat = ({ messages = [], onSendMessage }) => {
    const [chatOpen, setChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() && onSendMessage) {
            onSendMessage(newMessage);
            setNewMessage('');
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
                    <ScrollArea className="flex-1 mt-4 mb-4 lg:h-[calc(60vh-180px)]">
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarImage src={message.user.avatar} alt={message.user.name} />
                                            <AvatarFallback>{message.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
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
                            <Button type="submit" size="icon" className="h-9 w-9">
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
