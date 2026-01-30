import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import MessageItem from './MessageItem';
import RecordingIndicator from './RecordingIndicator';
import TypingIndicator from './TypingIndicator';

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
    typingUsers = [],
    recordingUsers = [],
}) {
    const isCurrentUserMessage = (senderId) => {
        return String(senderId) === String(currentUser.id);
    };

    // Skeleton loader dial messages
    const MessageSkeleton = () => (
        <div className="mx-auto max-w-3xl space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`mb-4 flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    {i % 2 !== 0 && <Skeleton className="mr-2 h-8 w-8 rounded-full" />}
                    <div className="max-w-[75%] space-y-2">
                        <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'bg-alpha/20' : 'bg-muted'}`} />
                        <Skeleton className="ml-auto h-4 w-20 rounded" />
                    </div>
                    {i % 2 === 0 && <Skeleton className="ml-2 h-8 w-8 rounded-full" />}
                </div>
            ))}
        </div>
    );

    return (
        <ScrollArea className={cn('min-h-0 flex-1 p-4', showToolbox && !previewAttachment && 'w-2/3')}>
            {loading && messages.length === 0 ? (
                <MessageSkeleton />
            ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <MessageCircle className="mb-4 h-16 w-16 opacity-20" />
                    <p className="text-base font-medium">No messages yet</p>
                    <p className="mt-1 text-sm opacity-70">Start the conversation!</p>
                </div>
            ) : (
                <div className="mx-auto max-w-3xl space-y-4">
                    {messages.map((message, index) => {
                        const isCurrentUser = isCurrentUserMessage(message.sender_id);
                        const showDateSeparator =
                            index === 0 || new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

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
                    {/* Typing indicators */}
                    {typingUsers.length > 0 &&
                        typingUsers.map((userId) => {
                            const user = userId === conversation.other_user.id ? conversation.other_user : null;
                            return user ? <TypingIndicator key={userId} userName={user.name} isCurrentUser={false} /> : null;
                        })}
                    {/* Recording indicators */}
                    {recordingUsers.length > 0 &&
                        recordingUsers.map((userId) => {
                            const user = userId === conversation.other_user.id ? conversation.other_user : null;
                            return user ? <RecordingIndicator key={userId} userName={user.name} isCurrentUser={false} /> : null;
                        })}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </ScrollArea>
    );
}
