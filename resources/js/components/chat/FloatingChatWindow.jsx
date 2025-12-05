import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, X, Send, Loader2, Paperclip, Mic, Square, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function FloatingChatWindow({ conversation, onClose, onMinimize, onExpand, isMinimized, isExpanded }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [messages, setMessages] = useState(conversation.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(null);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isMinimized && !isExpanded) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        } else if (isExpanded) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [conversation.id, isMinimized, isExpanded]);

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/chat/conversation/${conversation.id}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { 
                        type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
                    });
                    setAudioBlob(blob);
                    const url = URL.createObjectURL(blob);
                    setAudioURL(url);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                setIsRecording(false);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Microphone access denied. Please allow microphone access to record audio.');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setAudioBlob(null);
            setAudioURL(null);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment && !audioBlob) || sending) return;

        setSending(true);
        const messageBody = newMessage.trim();
        const formData = new FormData();
        
        formData.append('body', messageBody);
        
        if (attachment) {
            formData.append('attachment', attachment);
            formData.append('attachment_type', attachment.type.startsWith('image/') ? 'image' : 'file');
        }
        
        if (audioBlob) {
            formData.append('attachment', audioBlob, 'audio.webm');
            formData.append('attachment_type', 'audio');
        }

        // Reset form
        setNewMessage('');
        setAttachment(null);
        setAudioBlob(null);
        setAudioURL(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            const response = await fetch(`/chat/conversation/${conversation.id}/send`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, data.message]);
                setTimeout(() => fetchMessages(), 500);
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const isCurrentUserMessage = (senderId) => {
        return String(senderId) === String(currentUser.id);
    };

    const handlePlayAudio = (audioPath, messageId) => {
        if (isPlayingAudio === messageId) {
            // Stop current audio
            const audio = document.getElementById(`audio-${messageId}`);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlayingAudio(null);
            }
        } else {
            // Stop any currently playing audio
            if (isPlayingAudio) {
                const currentAudio = document.getElementById(`audio-${isPlayingAudio}`);
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
            }
            
            // Play new audio
            setIsPlayingAudio(messageId);
            setTimeout(() => {
                const audio = document.getElementById(`audio-${messageId}`);
                if (audio) {
                    audio.play();
                    audio.onended = () => setIsPlayingAudio(null);
                    audio.onerror = () => {
                        setIsPlayingAudio(null);
                        alert('Failed to play audio');
                    };
                }
            }, 100);
        }
    };

    const renderMessage = (message) => {
        const isCurrentUser = isCurrentUserMessage(message.sender_id);
        
        return (
            <div key={message.id} className={cn("flex mb-3", isCurrentUser ? "justify-end" : "justify-start")}>
                <div className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                    isCurrentUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                )}>
                    {message.body && (
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    )}
                    
                    {message.attachment_type === 'image' && message.attachment_path && (
                        <img 
                            src={`/storage/${message.attachment_path}`} 
                            alt="Attachment"
                            className="mt-2 rounded max-w-full max-h-64 object-contain"
                        />
                    )}
                    
                    {message.attachment_type === 'file' && message.attachment_path && (
                        <a
                            href={`/storage/${message.attachment_path}`}
                            download={message.attachment_name}
                            className={cn(
                                "mt-2 flex items-center gap-2 p-2 rounded border",
                                isCurrentUser ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-background border-border"
                            )}
                        >
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs truncate">{message.attachment_name || 'Attachment'}</span>
                        </a>
                    )}
                    
                    {message.attachment_type === 'audio' && message.attachment_path && (
                        <div className={cn(
                            "mt-2 flex items-center gap-2 p-2 rounded",
                            isCurrentUser ? "bg-primary-foreground/10" : "bg-background"
                        )}>
                            <button
                                onClick={() => handlePlayAudio(message.attachment_path, message.id)}
                                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                {isPlayingAudio === message.id ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </button>
                            <audio 
                                id={`audio-${message.id}`}
                                src={`/storage/${message.attachment_path}`}
                                className="hidden"
                            />
                            <span className="text-xs">Voice message</span>
                        </div>
                    )}
                    
                    <p className={cn(
                        "text-xs mt-1",
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {format(new Date(message.created_at), 'h:mm a')}
                    </p>
                </div>
            </div>
        );
    };

    if (isMinimized) {
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(m => !m.is_read && !isCurrentUserMessage(m.sender_id)).length;
        
        return (
            <div className="bg-white dark:bg-dark border border-border rounded-t-lg shadow-lg cursor-pointer overflow-hidden">
                <div 
                    onClick={onMinimize}
                    className="flex items-center gap-2 p-3 hover:bg-accent transition-colors"
                >
                    <Avatar
                        className="h-8 w-8"
                        image={conversation.other_user.image}
                        name={conversation.other_user.name}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.other_user.name}</p>
                        {lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                                {lastMessage.attachment_type === 'audio' 
                                    ? '🎤 Voice message' 
                                    : lastMessage.attachment_type === 'image'
                                    ? '📷 Image'
                                    : lastMessage.attachment_type === 'file'
                                    ? '📎 File'
                                    : lastMessage.body}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const windowSize = isExpanded 
        ? { width: '100%', height: '100%' }
        : { width: '320px', height: '500px' };

    return (
        <div 
            className={cn(
                "bg-white dark:bg-dark border border-border rounded-lg shadow-xl flex flex-col",
                isExpanded && "rounded-lg"
            )}
            style={windowSize}
        >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b shrink-0">
                <Avatar
                    className="h-8 w-8 flex-shrink-0"
                    image={conversation.other_user.image}
                    name={conversation.other_user.name}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{conversation.other_user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Online</p>
                </div>
                {onExpand && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExpand}
                        className="h-7 w-7"
                    >
                        {isExpanded ? (
                            <Minimize2 className="h-3.5 w-3.5" />
                        ) : (
                            <Maximize2 className="h-3.5 w-3.5" />
                        )}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMinimize}
                    className="h-7 w-7"
                >
                    <Minimize2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className={cn("flex-1 min-h-0", isExpanded ? "p-6" : "p-3")}>
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className={cn("space-y-1", isExpanded && "max-w-4xl mx-auto")}>
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Audio Preview */}
            {audioURL && !audioBlob && (
                <div className="p-3 border-t shrink-0 flex items-center gap-2 bg-muted/50">
                    <audio src={audioURL} controls className="flex-1 h-8" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setAudioBlob(null);
                            setAudioURL(null);
                        }}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Attachment Preview */}
            {attachment && (
                <div className="p-3 border-t shrink-0 flex items-center gap-2 bg-muted/50">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm truncate flex-1">{attachment.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAttachment(null)}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t shrink-0">
                <div className="flex gap-2 items-end">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-9 shrink-0"
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                        {isRecording ? (
                            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-red-600 dark:text-red-400">Recording...</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={stopRecording}
                                    className="h-7 w-7"
                                >
                                    <Square className="h-4 w-4 fill-red-500 text-red-500" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={cancelRecording}
                                    className="h-7 w-7"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className={cn("h-9 text-sm", isExpanded && "text-base h-10")}
                                    disabled={sending}
                                />
                                {audioBlob && !audioURL && (
                                    <div className="absolute -top-10 left-0 right-0 p-2 bg-muted rounded border">
                                        <div className="flex items-center gap-2">
                                            <Mic className="h-4 w-4" />
                                            <span className="text-xs">Audio ready to send</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setAudioBlob(null);
                                                    if (mediaRecorderRef.current) {
                                                        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                                                    }
                                                }}
                                                className="h-6 w-6 ml-auto"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    {!isRecording ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={stopRecording}
                                className="h-9 w-9 shrink-0"
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Button 
                                type="submit" 
                                size="icon" 
                                disabled={sending || (!newMessage.trim() && !attachment && !audioBlob)} 
                                className="h-9 w-9 shrink-0"
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </>
                    ) : null}
                </div>
            </form>
        </div>
    );
}
