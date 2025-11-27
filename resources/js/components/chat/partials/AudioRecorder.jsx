import React, { useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Component dial audio recording style Instagram m3a waves animation w timer
export default function AudioRecorder({ onSend, onCancel, isRecording, recordingTime }) {
    const animationRef = useRef(null);
    const barsRef = useRef([]);

    // Animation dial waves bach tban b7al real audio
    useEffect(() => {
        if (!isRecording) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const animate = () => {
            barsRef.current.forEach((bar, index) => {
                if (bar) {
                    const level = Math.random() * 0.8 + 0.2;
                    const height = (Math.sin(Date.now() / 100 + index * 0.5) * 0.5 + 0.5) * 100 * level;
                    bar.style.height = `${Math.max(10, height)}%`;
                }
            });
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRecording]);

    // Format dial time (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 p-2 bg-alpha/10 rounded-lg border border-alpha/20">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-8 w-8 hover:bg-alpha/20 text-alpha"
                title="Cancel recording"
            >
                <X className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
                <div className="h-3 w-3 bg-alpha rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground tabular-nums min-w-[3rem]">
                    {formatTime(recordingTime)}
                </span>
                <div className="flex-1 h-8 flex items-center justify-center gap-0.5 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            ref={el => barsRef.current[i] = el}
                            className={cn(
                                "w-0.5 bg-alpha rounded-full transition-all duration-100 ease-out",
                                isRecording ? "opacity-100" : "opacity-0"
                            )}
                            style={{ height: '10%' }}
                        />
                    ))}
                </div>
            </div>

            <Button
                type="button"
                size="icon"
                onClick={onSend}
                className="h-9 w-9 shrink-0 bg-alpha text-beta hover:bg-alpha/90 disabled:opacity-50"
                title="Send audio"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
