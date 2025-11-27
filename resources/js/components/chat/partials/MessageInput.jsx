import React from 'react';
import { X, Send, Paperclip, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AudioRecorder from './AudioRecorder';

// Component dial input dial message
export default function MessageInput({
    newMessage,
    setNewMessage,
    sending,
    isRecording,
    recordingTime,
    attachment,
    setAttachment,
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
}) {
    // Format audio duration
    const formatAudioDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <form onSubmit={handleSendMessage} className="p-4 border-t shrink-0 bg-alpha/5">
            {/* Attachment Preview */}
            {attachment && (
                <div className="mb-2 px-3 py-2 bg-background rounded-lg border flex items-center gap-2">
                    {attachment.type.startsWith('image/') ? (
                        <span className="text-xs">📷 Image selected</span>
                    ) : (
                        <span className="text-xs">📎 {attachment.name}</span>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachment(null)}
                        className="h-6 w-6 ml-auto"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Audio Preview */}
            {audioURL && audioBlob && (
                <div className="mb-2 px-3 py-2 bg-background rounded-lg border flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs flex-1">Voice message ready</span>
                    {audioDuration && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {formatAudioDuration(audioDuration)}
                        </span>
                    )}
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
                        recordingTime={recordingTime}
                    />
                </div>
            )}

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
                    className="h-9 w-9 shrink-0 hover:bg-alpha/10"
                    title="Attach file"
                >
                    <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={cn("h-9 text-sm pr-12", isExpanded && "text-base h-10")}
                        disabled={sending || isRecording}
                    />
                </div>
                
                {!isRecording ? (
                    <>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                startRecording();
                            }}
                            onMouseUp={(e) => {
                                e.preventDefault();
                                stopRecording();
                            }}
                            onMouseLeave={stopRecording}
                            className="h-9 w-9 shrink-0 hover:bg-alpha/10"
                            title="Record audio"
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={sending || (!newMessage.trim() && !attachment && !audioBlob)} 
                            className="h-9 w-9 shrink-0 bg-alpha text-beta hover:bg-alpha/90 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </>
                ) : null}
            </div>
        </form>
    );
}

