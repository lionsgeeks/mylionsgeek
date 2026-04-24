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
    previewAttachment,
    typingUsers = [],
    recordingUsers = [],
}) {
    const isCurrentUserMessage = (senderId) => {
        return String(senderId) === String(currentUser.id);
    };

    const isSameSender = (a, b) => {
        if (!a || !b) return false;
        return String(a.sender_id) === String(b.sender_id);
    };

    const isSameCalendarDay = (a, b) => {
        if (!a || !b) return false;
        const da = new Date(a.created_at);
        const db = new Date(b.created_at);
        if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
        return da.toDateString() === db.toDateString();
    };

    const minutesBetween = (a, b) => {
        if (!a || !b) return Infinity;
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        if (Number.isNaN(ta) || Number.isNaN(tb)) return Infinity;
        return Math.abs(ta - tb) / (1000 * 60);
    };

    const shouldGroupWithPrevious = (message, previousMessage) => {
        return isSameSender(message, previousMessage) && isSameCalendarDay(message, previousMessage) && minutesBetween(message, previousMessage) <= 2;
    };

    const shouldGroupWithNext = (message, nextMessage) => {
        return isSameSender(message, nextMessage) && isSameCalendarDay(message, nextMessage) && minutesBetween(message, nextMessage) <= 2;
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
        <ScrollArea className={cn('h-full p-4', previewAttachment && 'pointer-events-none opacity-0')}>
            {loading && messages.length === 0 ? (
                <MessageSkeleton />
            ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <MessageCircle className="mb-4 h-16 w-16 opacity-20" />
                    <p className="text-base font-medium">No messages yet</p>
                    <p className="mt-1 text-sm opacity-70">Start the conversation!</p>
                </div>
            ) : (
                <div className="mx-auto max-w-3xl space-y-3">
                    {messages.map((message, index) => {
                        const isCurrentUser = isCurrentUserMessage(message.sender_id);
                        const showDateSeparator =
                            index === 0 || new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

                        const prev = index > 0 ? messages[index - 1] : null;
                        const next = index < messages.length - 1 ? messages[index + 1] : null;
                        const groupWithPrev = shouldGroupWithPrevious(message, prev);
                        const groupWithNext = shouldGroupWithNext(message, next);

                        return (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isCurrentUser={isCurrentUser}
                                currentUser={currentUser}
                                otherUser={conversation.other_user}
                                showDateSeparator={showDateSeparator}
                                groupWithPrev={groupWithPrev}
                                groupWithNext={groupWithNext}
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
