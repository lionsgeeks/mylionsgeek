import React from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import MessageItem from './MessageItem';

// Component dial list dial messages
export default function MessageList({
    messages,
    loading,
    currentUser,
    conversation,
    isPlayingAudio,
    audioProgress,
    audioDuration,
    showMenuForMessage,
    onPlayAudio,
    onDeleteMessage,
    onMenuToggle,
    onPreviewAttachment,
    onDownloadAttachment,
    formatMessageTime,
    formatSeenTime,
    messagesEndRef,
    showToolbox,
    previewAttachment,
}) {
    const isCurrentUserMessage = (senderId) => {
        return String(senderId) === String(currentUser.id);
    };

    // Skeleton loader dial messages
    const MessageSkeleton = () => (
        <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex mb-4 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    {i % 2 !== 0 && (
                        <Skeleton className="h-8 w-8 rounded-full mr-2" />
                    )}
                    <div className="max-w-[75%] space-y-2">
                        <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'bg-alpha/20' : 'bg-muted'}`} />
                        <Skeleton className="h-4 w-20 ml-auto rounded" />
                    </div>
                    {i % 2 === 0 && (
                        <Skeleton className="h-8 w-8 rounded-full ml-2" />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <ScrollArea className={cn("flex-1 min-h-0 p-4", showToolbox && !previewAttachment && "w-2/3")}>
            {loading && messages.length === 0 ? (
                <MessageSkeleton />
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-base font-medium">No messages yet</p>
                    <p className="text-sm mt-1 opacity-70">Start the conversation!</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((message, index) => {
                        const isCurrentUser = isCurrentUserMessage(message.sender_id);
                        const showDateSeparator = index === 0 || 
                            new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
                        
                        return (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isCurrentUser={isCurrentUser}
                                currentUser={currentUser}
                                otherUser={conversation.other_user}
                                showDateSeparator={showDateSeparator}
                                isPlayingAudio={isPlayingAudio}
                                audioProgress={audioProgress}
                                audioDuration={audioDuration}
                                showMenuForMessage={showMenuForMessage}
                                onPlayAudio={onPlayAudio}
                                onDeleteMessage={onDeleteMessage}
                                onMenuToggle={onMenuToggle}
                                onPreviewAttachment={onPreviewAttachment}
                                onDownloadAttachment={onDownloadAttachment}
                                formatMessageTime={formatMessageTime}
                                formatSeenTime={formatSeenTime}
                            />
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </ScrollArea>
    );
}

