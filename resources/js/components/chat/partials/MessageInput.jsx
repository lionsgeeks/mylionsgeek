import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Mic, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AudioRecorder from './AudioRecorder';

// Component dial input dial message
export default function MessageInput({
    newMessage,
    setNewMessage,
    sending,
    isRecording,
    recordingTime,
    attachments = [],
    setAttachments,
    audioBlob,
    audioURL,
    setAudioBlob,
    setAudioURL,
    mediaRecorderRef,
    fileInputRef,
    handleFileSelect,
    startRecording,
    stopRecording,
    cancelRecording,
    handleSendMessage,
    isExpanded,
    audioDuration,
    onTypingStart,
    onTypingStop,
    isPaused,
    onPause,
    onResume,
}) {
    // Typing indicator management
    const typingTimeoutRef = useRef(null);
    const hasTypedRef = useRef(false);
    const lastTypingTimeRef = useRef(0);

    // Handle typing events on input change - triggers typing indicator
    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (!onTypingStart || !onTypingStop) return;

        // Only trigger if user is actually typing (has content)
        if (value.trim().length > 0) {
            const now = Date.now();

            // Debounce typing start - only trigger every 1 second max
            if (!hasTypedRef.current || now - lastTypingTimeRef.current > 1000) {
                onTypingStart();
                hasTypedRef.current = true;
                lastTypingTimeRef.current = now;
            }

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                onTypingStop();
                hasTypedRef.current = false;
            }, 2000);
        } else {
            // Stop typing if input is cleared
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            onTypingStop();
            hasTypedRef.current = false;
        }
    };

    // Stop typing when message is sent or component unmounts
    useEffect(() => {
        if (!newMessage.trim() && hasTypedRef.current && onTypingStop) {
            onTypingStop();
            hasTypedRef.current = false;
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (hasTypedRef.current && onTypingStop) {
                onTypingStop();
            }
        };
    }, [newMessage, onTypingStop]);

    // Format audio duration
    const formatAudioDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const imageAttachments = useMemo(() => attachments.filter((file) => file?.type?.startsWith('image/')), [attachments]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const activeImage = imageAttachments[activeImageIndex] ?? null;
    const activeImagePreviewUrl = useMemo(() => {
        if (!activeImage) return null;
        return URL.createObjectURL(activeImage);
    }, [activeImage]);

    useEffect(() => {
        return () => {
            if (activeImagePreviewUrl) {
                URL.revokeObjectURL(activeImagePreviewUrl);
            }
        };
    }, [activeImagePreviewUrl]);

    useEffect(() => {
        if (imageAttachments.length === 0) {
            setIsImagePreviewOpen(false);
        }
        if (activeImageIndex >= imageAttachments.length) {
            setActiveImageIndex(Math.max(0, imageAttachments.length - 1));
        }
    }, [imageAttachments.length, activeImageIndex]);

    // Open preview automatically right after selecting images
    const previousImageCountRef = useRef(imageAttachments.length);
    useEffect(() => {
        if (imageAttachments.length > previousImageCountRef.current) {
            setActiveImageIndex(imageAttachments.length - 1);
            setIsImagePreviewOpen(true);
        }
        previousImageCountRef.current = imageAttachments.length;
    }, [imageAttachments.length]);

    const removeAttachmentAtIndex = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };
    return (
        <form onSubmit={handleSendMessage} className="shrink-0 border-t bg-alpha/5 p-4">
            {/* Attachment Preview */}
            {attachments.length > 0 && (
                <>
                    <div className="mb-2 space-y-2">
                        {attachments.map((file, index) => {
                            const isImage = Boolean(file?.type?.startsWith('image/'));
                            return (
                                <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                                    <span className="text-xs">{isImage ? '📷' : '📎'} {isImage ? 'Image selected' : file.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttachmentAtIndex(index)}
                                        className="ml-auto h-6 w-6"
                                        title="Remove attachment"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {activeImage && activeImagePreviewUrl && (
                        <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle className="truncate text-base">{activeImage.name}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-3 md:grid-cols-[1fr,220px]">
                                    <div className="max-h-[70vh] overflow-auto rounded-md border bg-background p-2">
                                        <img
                                            src={activeImagePreviewUrl}
                                            alt={activeImage.name}
                                            className="h-auto w-full rounded-md object-contain"
                                        />
                                    </div>
                                    <div className="max-h-[70vh] overflow-auto rounded-md border bg-background p-2">
                                        <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
                                            {imageAttachments.map((file, idx) => (
                                                <button
                                                    key={`${file.name}-${file.size}-${idx}`}
                                                    type="button"
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={cn(
                                                        'rounded-md border p-1 text-left text-xs hover:bg-accent/40',
                                                        idx === activeImageIndex && 'border-alpha',
                                                    )}
                                                    title={file.name}
                                                >
                                                    <div className="truncate">{file.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </>
            )}

            {/* Audio Preview */}
            {audioURL && audioBlob && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="flex-1 text-xs">Voice message ready</span>
                    {audioDuration && <span className="text-xs text-muted-foreground tabular-nums">{formatAudioDuration(audioDuration)}</span>}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setAudioBlob(null);
                            setAudioURL(null);
                        }}
                        className="h-6 w-6"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Recording Indicator - Instagram Style */}
            {isRecording && (
                <div className="mb-2">
                    <AudioRecorder
                        onSend={() => {
                            stopRecording();
                            // Wait a bit bach audio blob ykon ready
                            setTimeout(() => {
                                if (audioBlob) {
                                    handleSendMessage(new Event('submit'));
                                }
                            }, 100);
                        }}
                        onCancel={cancelRecording}
                        isRecording={isRecording}
                        isPaused={isPaused}
                        onPause={onPause}
                        onResume={onResume}
                        recordingTime={recordingTime}
                    />
                </div>
            )}

            <div className="flex items-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 w-9 shrink-0 hover:bg-alpha/10"
                    title="Attach file"
                >
                    <Paperclip className="h-4 w-4" />
                </Button>

                <div className="relative flex-1">
                    <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className={cn('h-9 pr-12 text-sm', isExpanded && 'h-10 text-base')}
                        disabled={sending || isRecording}
                    />
                </div>

                {!isRecording ? (
                    <>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                startRecording();
                            }}
                            className="h-9 w-9 shrink-0 hover:bg-alpha/10"
                            title="Record audio"
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={sending || (!newMessage.trim() && attachments.length === 0 && !audioBlob)}
                            className="h-9 w-9 shrink-0 bg-alpha text-black hover:bg-alpha/90 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </>
                ) : null}
            </div>
        </form>
    );
}
