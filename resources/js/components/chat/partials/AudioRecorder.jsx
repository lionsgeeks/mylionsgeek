import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Component dial audio recording style Instagram m3a waves animation w timer
export default function AudioRecorder({ onSend, onCancel, isRecording, recordingTime }) {
    const animationRef = useRef(null);
    const barsRef = useRef([]);
    const [audioLevel, setAudioLevel] = useState(0);

    // Animation dial waves bach tban b7al real audio
    useEffect(() => {
        if (!isRecording) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const animate = () => {
            // Generate random level dial audio (bach tban b7al real)
            const newLevel = Math.random() * 0.8 + 0.2; // Between 0.2 and 1.0
            setAudioLevel(newLevel);

            barsRef.current.forEach((bar, index) => {
                if (bar) {
                    const height = (Math.sin(Date.now() / 100 + index * 0.5) * 0.5 + 0.5) * 100 * newLevel;
                    bar.style.height = `${Math.max(10, height)}%`; // Minimum height bach ybano dima
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
        const remainingSeconds = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-8 w-8 hover:bg-red-200 dark:hover:bg-red-800 text-red-500"
                title="Cancel recording"
            >
                <X className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300 tabular-nums min-w-[3rem]">
                    {formatTime(recordingTime)}
                </span>
                {/* Waves dial audio - 20 bars */}
                <div className="flex-1 h-8 flex items-center justify-center gap-0.5 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            ref={el => barsRef.current[i] = el}
                            className={cn(
                                "w-0.5 bg-red-500 rounded-full transition-all duration-100 ease-out",
                                isRecording ? "opacity-100" : "opacity-0"
                            )}
                            style={{ height: '10%' }} // Initial height
                        />
                    ))}
                </div>
            </div>

            <Button
                type="button"
                size="icon"
                onClick={onSend}
                className="h-9 w-9 shrink-0 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                title="Send audio"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
