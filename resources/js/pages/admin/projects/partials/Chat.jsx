import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

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
        <div className="fixed right-4 bottom-4">
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-4 lg:h-screen lg:w-1/4">
                    <SheetHeader>
                        <SheetTitle>Team Chat</SheetTitle>
                        <SheetDescription>Chat with your team members</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="mt-4 mb-4 flex-1 lg:h-[calc(60vh-180px)]">
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((message) => (
                                    <div key={message.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarImage src={message.user.avatar} alt={message.user.name} />
                                            <AvatarFallback>{message.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-medium">{message.user.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(message.timestamp).toLocaleTimeString(undefined, {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
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
                        <form onSubmit={handleSubmit} className="flex w-full gap-2">
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
