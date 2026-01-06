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

    // Format time as 0:00:06 (HH:MM:SS or MM:SS)
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
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
            "flex items-center gap-3",
            isCurrentUser 
                ? "text-primary-foreground" 
                : "text-foreground"
        )}>
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                className="hidden"
            />
            
            {/* Simple circular play button */}
            <button
                onClick={togglePlayback}
                className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                    "hover:opacity-80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isCurrentUser 
                        ? "bg-white text-foreground focus:ring-primary/50" 
                        : "bg-white text-foreground border border-border/20 focus:ring-muted-foreground/30"
                )}
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current stroke-current" />
                ) : (
                    <Play className="h-4 w-4 ml-0.5 fill-current stroke-current" />
                )}
            </button>

            {/* Duration display */}
            <div className="flex-1 min-w-0">
                <div className={cn(
                    "text-sm font-medium tabular-nums",
                    isCurrentUser ? "text-primary-foreground" : "text-foreground"
                )}>
                    {formatTime(duration || 0)}
                </div>
            </div>
        </div>
    );
}

