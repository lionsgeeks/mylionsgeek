import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VoiceMessage({ 
    audioUrl, 
    duration, 
    isCurrentUser,
    onPlayStateChange 
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Play/pause toggle
    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Pause all other audio elements on the page
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(audio => {
                if (audio !== audioRef.current && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });

            audioRef.current.play();
        }
    };

    // Update progress
    const updateProgress = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || duration || 1;
            setCurrentTime(current);
            setProgress((current / total) * 100);
        }
    };

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            setIsPlaying(true);
            if (onPlayStateChange) {
                onPlayStateChange(true);
            }
            // Start progress updates
            progressIntervalRef.current = setInterval(updateProgress, 100);
        };

        const handlePause = () => {
            setIsPlaying(false);
            if (onPlayStateChange) {
                onPlayStateChange(false);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            if (audio) {
                audio.currentTime = 0;
            }
            if (onPlayStateChange) {
                onPlayStateChange(false);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };

        const handleTimeUpdate = () => {
            updateProgress();
        };

        const handleLoadedMetadata = () => {
            updateProgress();
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Pause if another audio starts playing
        const handleOtherAudioPlay = () => {
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(a => {
                if (a !== audio && !a.paused) {
                    audio.pause();
                }
            });
        };

        document.addEventListener('play', handleOtherAudioPlay, true);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            document.removeEventListener('play', handleOtherAudioPlay, true);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [audioUrl, duration, onPlayStateChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    // Pause when component unmounts or audio changes
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [audioUrl]);

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            isCurrentUser ? "bg-primary/10" : "bg-muted"
        )}>
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                className="hidden"
            />
            
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-10 w-10 rounded-full flex-shrink-0",
                    isCurrentUser 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-background hover:bg-muted"
                )}
                onClick={togglePlayback}
            >
                {isPlaying ? (
                    <Pause className="h-5 w-5" />
                ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                )}
            </Button>

            <div className="flex-1 min-w-0">
                {/* Progress bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-100",
                            isCurrentUser ? "bg-primary" : "bg-foreground/60"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                {/* Time labels */}
                <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {formatTime(currentTime || 0)}
                    </span>
                    <span className={cn(
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {formatTime(duration || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}

