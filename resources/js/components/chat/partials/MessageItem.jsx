import React from 'react';
import { Clock, Check, CheckCheck, Trash2, MoreVertical, Play, Pause, FileIcon, Download, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

// Component dial message wahda
export default function MessageItem({
    message,
    isCurrentUser,
    currentUser,
    otherUser,
    showDateSeparator,
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
}) {
    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    // Format audio duration
    const formatAudioDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <>
            {showDateSeparator && (
                <div className="flex justify-center my-4">
                    <span className="text-xs bg-alpha/10 text-alpha px-3 py-1 rounded-full">
                        {isToday(new Date(message.created_at))
                            ? 'Today'
                            : isYesterday(new Date(message.created_at))
                                ? 'Yesterday'
                                : format(new Date(message.created_at), 'MMMM d, yyyy')}
                    </span>
                </div>
            )}
            <div className={cn("flex mb-4 group relative", isCurrentUser ? "justify-end" : "justify-start")}>
                {!isCurrentUser && (
                    <button
                        onClick={() => router.visit(`/students/${otherUser.id}`)}
                        className="flex-shrink-0 mr-2 hover:opacity-80 transition-opacity"
                    >
                        <Avatar
                            className="h-8 w-8 cursor-pointer"
                            image={otherUser.image}
                            name={otherUser.name}
                        />
                    </button>
                )}
                <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group/message",
                    isCurrentUser
                        ? "bg-alpha text-beta rounded-br-md"
                        : "bg-muted rounded-bl-md"
                )}>
                    {message.body && (
                        <p className={cn(
                            "whitespace-pre-wrap break-words leading-relaxed",
                            isCurrentUser ? "text-beta" : ""
                        )}>{message.body}</p>
                    )}

                    {message.attachment_type === 'image' && message.attachment_path && (
                        <div className="mt-1 rounded-lg overflow-hidden cursor-pointer" onClick={() => onPreviewAttachment({ type: 'image', path: message.attachment_path, name: message.attachment_name })}>
                            <img
                                src={message.attachment_path.startsWith('/storage/') || message.attachment_path.startsWith('blob:') ? message.attachment_path : `/storage/${message.attachment_path}`}
                                alt="Attachment"
                                className="max-w-full max-h-64 object-cover rounded-lg hover:opacity-90 transition-opacity"
                            />
                            {message.attachment_size && (
                                <div className="mt-1 text-xs text-muted-foreground">{formatFileSize(message.attachment_size)}</div>
                            )}
                        </div>
                    )}

                    {message.attachment_type === 'video' && message.attachment_path && (
                        <div className="mt-1 rounded-lg overflow-hidden cursor-pointer relative group/video" onClick={() => onPreviewAttachment({ type: 'video', path: message.attachment_path, name: message.attachment_name })}>
                            <video
                                src={message.attachment_path.startsWith('/storage/') || message.attachment_path.startsWith('blob:') ? message.attachment_path : `/storage/${message.attachment_path}`}
                                className="max-w-full max-h-64 object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity">
                                <VideoIcon className="h-12 w-12 text-white" />
                            </div>
                            {message.attachment_size && (
                                <div className="mt-1 text-xs text-muted-foreground">{formatFileSize(message.attachment_size)}</div>
                            )}
                        </div>
                    )}

                    {message.attachment_type === 'file' && message.attachment_path && (
                        <button
                            onClick={() => onDownloadAttachment(message.attachment_path, message.attachment_name)}
                            className={cn(
                                "mt-2 w-full flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-alpha/10",
                                isCurrentUser ? "bg-beta/10 border-beta/20 text-beta" : "bg-background border-border"
                            )}
                        >
                            <FileIcon className={cn("h-5 w-5 flex-shrink-0", isCurrentUser ? "text-alpha" : "")} />
                            <div className="flex-1 min-w-0 text-left">
                                <span className="text-xs truncate block">{message.attachment_name || 'Attachment'}</span>
                                {message.attachment_size && (
                                    <span className="text-xs text-muted-foreground">{formatFileSize(message.attachment_size)}</span>
                                )}
                            </div>
                            <Download className={cn("h-4 w-4 flex-shrink-0", isCurrentUser ? "text-alpha" : "")} />
                        </button>
                    )}

                    {message.attachment_type === 'audio' && message.attachment_path && (
                        <div className={cn(
                            "mt-2 flex items-center gap-3 p-3 rounded-lg",
                            isCurrentUser ? "bg-beta/10" : "bg-background"
                        )}>
                            <button
                                onClick={() => onPlayAudio(message.attachment_path, message.id)}
                                className={cn(
                                    "p-2.5 rounded-full transition-all hover:scale-110",
                                    isCurrentUser ? "bg-alpha text-beta hover:bg-alpha/90" : "bg-muted hover:bg-accent"
                                )}
                            >
                                {isPlayingAudio === message.id ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4 ml-0.5" />
                                )}
                            </button>
                            <audio
                                id={`audio-${message.id}`}
                                src={message.attachment_path.startsWith('/storage/') || message.attachment_path.startsWith('blob:') ? message.attachment_path : `/storage/${message.attachment_path}`}
                                className="hidden"
                            />
                            <div className="flex-1">
                                <div className="h-2 bg-beta/20 rounded-full overflow-hidden">
                                    <div className={cn(
                                        "h-full rounded-full transition-all duration-300",
                                        isCurrentUser ? "bg-dark" : "bg-primary",
                                        isPlayingAudio === message.id ? "" : ""
                                    )} style={{ width: `${audioProgress[message.id] || 0}%` }} />
                                </div>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className={cn("text-xs", isCurrentUser ? "text-beta/70" : "opacity-70")}>Voice message</span>
                                    {(audioDuration[message.id] || message.audio_duration) && (
                                        <span className={cn("text-xs tabular-nums", isCurrentUser ? "text-beta/70" : "opacity-70")}>
                                            {formatAudioDuration(audioDuration[message.id] || message.audio_duration)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        "text-xs mt-1.5 flex items-center gap-1.5 justify-end",
                        isCurrentUser ? "text-beta/70" : "text-muted-foreground"
                    )}>
                        <span>{formatMessageTime(message.created_at)}</span>
                        {isCurrentUser && (
                            <span className="ml-1">
                                {message.pending ? (
                                    <Clock className="h-3 w-3 inline" />
                                ) : message.is_read && message.read_at ? (
                                    <CheckCheck className="h-3.5 w-3.5 inline text-blue-400" title={formatSeenTime(message.read_at)} />
                                ) : (
                                    <Check className="h-3.5 w-3.5 inline" />
                                )}
                            </span>
                        )}
                    </div>

                    {isCurrentUser && showMenuForMessage === message.id && (
                        <div className={cn(
                            "absolute top-2 right-2 rounded-lg shadow-lg border p-1 z-10",
                            "bg-background dark:bg-dark_gray",
                            "border-border dark:border-border"
                        )}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onDeleteMessage(message.id);
                                    onMenuToggle(null);
                                }}
                                className={cn(
                                    "w-full justify-start text-xs text-error",
                                    "hover:bg-error/10 dark:hover:bg-error/20"
                                )}
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                            </Button>
                        </div>
                    )}

                    {isCurrentUser && (
                        <button
                            onClick={() => onMenuToggle(showMenuForMessage === message.id ? null : message.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                {isCurrentUser && (
                    <button
                        onClick={() => router.visit(`/students/${currentUser.id}`)}
                        className="flex-shrink-0 ml-2 hover:opacity-80 transition-opacity"
                    >
                        <Avatar
                            className="h-8 w-8 cursor-pointer"
                            image={currentUser.image}
                            name={currentUser.name}
                        />
                    </button>
                )}
            </div>
        </>
    );
}

