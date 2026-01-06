import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VoiceRecorder({ onRecordingComplete, onCancel, disabled, onStopRecordingRef, onSendAudioDirect }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [canSend, setCanSend] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const shouldSendDirectlyRef = useRef(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const touchStartYRef = useRef(null);
    const touchStartTimeRef = useRef(null);
    const cancelZoneRef = useRef(null);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Start recording
    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Use WebM format (widely supported, good compression)
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                ? 'audio/webm' 
                : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/mp4'; // Fallback

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                audioBitsPerSecond: 128000, // 128 kbps for good quality
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    console.log('Received audio chunk:', event.data.size, 'bytes');
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped. Audio chunks:', audioChunksRef.current.length);
                
                // Wait a bit to ensure all chunks are collected
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (audioChunksRef.current.length > 0) {
                    console.log('Processing recording complete...');
                    await handleRecordingComplete();
                } else {
                    console.warn('No audio chunks available');
                    setError('No audio recorded');
                    setIsRecording(false);
                    setCanSend(false);
                }
                
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setError('Recording error occurred');
                stopRecording();
            };

            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setRecordingTime(0);
            setCanSend(false);
            shouldSendDirectlyRef.current = false; // Reset flag when starting new recording

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    const newTime = prev + 1;
                    // Allow sending after 0.5 seconds
                    if (newTime >= 1) {
                        setCanSend(true);
                    }
                    return newTime;
                });
            }, 1000);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError(err.name === 'NotAllowedError' 
                ? 'Microphone permission denied' 
                : err.name === 'NotFoundError'
                ? 'No microphone found'
                : 'Failed to start recording');
        }
    };

    // Stop recording - always auto-sends (like text messages)
    const stopRecordingAndSend = useCallback(() => {
        console.log('🛑 stopRecordingAndSend called', {
            hasRecorder: !!mediaRecorderRef.current,
            isRecording,
            canSend,
            recorderState: mediaRecorderRef.current?.state,
            chunksCount: audioChunksRef.current.length
        });

        if (!mediaRecorderRef.current) {
            console.error('❌ No media recorder available');
            return;
        }

        if (!isRecording) {
            console.warn('⚠️ Not currently recording');
            return;
        }

        if (!canSend) {
            console.warn('⚠️ Cannot send yet (recording too short)');
            return;
        }

        console.log('✅ Stopping recording - will auto-send immediately...', {
            currentChunks: audioChunksRef.current.length,
            recorderState: mediaRecorderRef.current.state
        });
        
        // Always auto-send when stopping (like text messages - no save step)
        shouldSendDirectlyRef.current = true;
        
        // Stop timer first
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Request final data chunk and stop
        try {
            const recorder = mediaRecorderRef.current;
            if (recorder.state === 'recording') {
                // Request any remaining data before stopping
                recorder.requestData();
                
                // Stop the recorder - onstop will be called automatically
                // and will trigger handleRecordingComplete which will auto-send
                recorder.stop();
                console.log('✅ Recorder stopped, waiting for onstop event...');
            } else if (recorder.state === 'inactive') {
                // Already stopped, process what we have
                console.log('ℹ️ Recorder already stopped, processing chunks...');
                // The onstop handler should have been called, but if not, trigger it
                if (audioChunksRef.current.length > 0) {
                    handleRecordingComplete();
                }
            } else {
                console.warn('⚠️ Recorder in unexpected state:', recorder.state);
            }
        } catch (err) {
            console.error('❌ Error stopping media recorder:', err);
            // If stop fails, try to process what we have
            if (audioChunksRef.current.length > 0) {
                console.log('Attempting to process existing chunks...');
                handleRecordingComplete();
            }
        }
        
        setIsRecording(false);
        // Don't set canSend to false yet - let handleRecordingComplete process it
    }, [isRecording, canSend]);

    // Stop recording without sending (cancel)
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
        setCanSend(false);
        // Clear audio chunks on cancel
        audioChunksRef.current = [];
    };

    // Handle recording complete
    const handleRecordingComplete = async () => {
        if (audioChunksRef.current.length === 0) {
            console.error('No audio chunks available');
            setError('No audio recorded');
            setIsRecording(false);
            setCanSend(false);
            return;
        }

        console.log('Creating audio blob from', audioChunksRef.current.length, 'chunks');
        setIsUploading(true);
        
        try {
            const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            console.log('Audio blob created:', {
                size: audioBlob.size,
                type: audioBlob.type
            });

            if (audioBlob.size === 0) {
                throw new Error('Audio blob is empty');
            }
            
            // Get audio duration
            let duration = recordingTime; // Default to recording time
            
            try {
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                duration = await new Promise((resolve) => {
                    const timeout = setTimeout(() => {
                        console.warn('Timeout waiting for audio metadata, using recording time');
                        URL.revokeObjectURL(audioUrl);
                        resolve(recordingTime);
                    }, 2000);
                    
                    const handleLoadedMetadata = () => {
                        clearTimeout(timeout);
                        const dur = audio.duration;
                        console.log('Audio duration from metadata:', dur);
                        
                        // Check if duration is valid
                        if (dur && isFinite(dur) && dur > 0 && dur < 3600) {
                            // Valid duration (less than 1 hour)
                            resolve(Math.round(dur));
                        } else {
                            console.warn('Invalid duration from metadata, using recording time');
                            resolve(recordingTime);
                        }
                        URL.revokeObjectURL(audioUrl);
                    };
                    
                    const handleError = (e) => {
                        clearTimeout(timeout);
                        console.warn('Error loading audio metadata:', e);
                        URL.revokeObjectURL(audioUrl);
                        resolve(recordingTime);
                    };
                    
                    audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
                    audio.addEventListener('error', handleError, { once: true });
                    
                    // Load the audio
                    audio.load();
                });
            } catch (err) {
                console.warn('Error getting audio duration:', err);
                duration = recordingTime;
            }
            
            // Ensure duration is a valid integer
            duration = Math.max(1, Math.round(duration || recordingTime || 1));
            console.log('Final audio duration:', duration);

            // If onSendAudioDirect is provided and we should send directly, send it immediately
            if (shouldSendDirectlyRef.current && onSendAudioDirect && audioBlob.size > 0) {
                console.log('📤 Auto-sending audio directly via onSendAudioDirect...', {
                    blobSize: audioBlob.size,
                    duration: duration,
                    mimeType: mimeType
                });
                shouldSendDirectlyRef.current = false;
                
                // Reset state immediately before sending (optimistic UI update)
                setIsUploading(false);
                setIsRecording(false);
                audioChunksRef.current = [];
                setCanSend(false);
                setRecordingTime(0);
                
                // Send directly without storing
                try {
                    await onSendAudioDirect(audioBlob, duration, mimeType);
                    console.log('✅ Audio sent successfully via onSendAudioDirect');
                } catch (err) {
                    console.error('❌ Error sending audio via onSendAudioDirect:', err);
                    setError('Failed to send audio: ' + err.message);
                }
                return; // Don't call onRecordingComplete when sending directly
            }
            
            // Otherwise, just store it via callback (for manual send later)
            console.log('Calling onRecordingComplete callback...');
            if (onRecordingComplete) {
                await onRecordingComplete(audioBlob, duration, mimeType);
                console.log('Recording complete callback finished');
            } else {
                console.error('onRecordingComplete callback is not defined');
            }
        } catch (err) {
            console.error('Error processing recording:', err);
            setError('Failed to process recording: ' + err.message);
        } finally {
            setIsUploading(false);
            setIsRecording(false);
            audioChunksRef.current = [];
            setCanSend(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        stopRecording();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setRecordingTime(0);
        setError(null);
        if (onCancel) {
            onCancel();
        }
    };

    // Mouse/Touch handlers
    const handleMouseDown = (e) => {
        if (disabled || isRecording) return;
        e.preventDefault();
        touchStartTimeRef.current = Date.now();
        startRecording();
    };

    const handleMouseUp = (e) => {
        if (!isRecording) return;
        e.preventDefault();
        const holdTime = Date.now() - touchStartTimeRef.current;
        
        // Check if user is in cancel zone (for mobile swipe)
        const cancelZone = cancelZoneRef.current;
        if (cancelZone && e.type === 'touchend') {
            const touch = e.changedTouches[0];
            const rect = cancelZone.getBoundingClientRect();
            const isInCancelZone = touch.clientY < rect.top || touch.clientY > rect.bottom;
            
            if (isInCancelZone || holdTime < 500) {
                handleCancel();
                return;
            }
        }
        
        // On release: auto-send if canSend, otherwise cancel
        if (canSend) {
            // Set flag to auto-send when recording stops
            shouldSendDirectlyRef.current = true;
            stopRecordingAndSend();
        } else {
            handleCancel();
        }
    };

    const handleMouseLeave = (e) => {
        if (isRecording && e.buttons === 0) {
            // Mouse left while recording, cancel if too short
            if (!canSend) {
                handleCancel();
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Expose stopRecordingAndSend function to parent via ref
    useEffect(() => {
        if (onStopRecordingRef) {
            onStopRecordingRef.current = {
                stopAndSend: stopRecordingAndSend,
                isRecording,
                canSend,
            };
            console.log('Updated voiceRecorderRef:', {
                isRecording,
                canSend,
                hasStopFunction: !!stopRecordingAndSend
            });
        }
    }, [isRecording, canSend, stopRecordingAndSend, onStopRecordingRef]);

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 w-full">
                <div 
                    ref={cancelZoneRef}
                    className="flex-1 flex items-center gap-4 bg-gradient-to-r from-destructive/15 via-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-xl px-5 py-3.5 shadow-lg backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Animated recording indicator */}
                        <div className="relative flex-shrink-0">
                            <div className="w-4 h-4 bg-destructive rounded-full animate-pulse shadow-lg shadow-destructive/50" />
                            <div className="absolute inset-0 w-4 h-4 bg-destructive rounded-full animate-ping opacity-60" />
                            <div className="absolute inset-0 w-4 h-4 bg-destructive/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                        </div>
                        
                        {/* Time display */}
                        <div className="flex items-baseline gap-2 min-w-0">
                            <span className="text-lg font-bold text-destructive tabular-nums tracking-tight">
                                {formatTime(recordingTime)}
                            </span>
                            <span className="text-xs font-medium text-destructive/70 whitespace-nowrap">
                                {canSend ? 'Ready to send' : 'Recording...'}
                            </span>
                        </div>
                        
                        {/* Waveform visualization */}
                        <div className="flex items-center gap-1 flex-1 justify-center">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-destructive/60 rounded-full animate-pulse"
                                    style={{
                                        height: `${20 + Math.sin(i * 0.8) * 15}px`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.6s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {canSend && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                console.log('🛑 Stop button clicked - stopping and auto-sending...');
                                stopRecordingAndSend();
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 px-4"
                            disabled={isUploading}
                            title="Stop recording and send"
                        >
                            {isUploading ? (
                                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Send'
                            )}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all duration-200 hover:scale-110 active:scale-95"
                        disabled={isUploading}
                        title="Cancel recording"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                "h-9 w-9 relative rounded-full transition-all duration-200",
                "hover:bg-primary/10 hover:scale-110 active:scale-95",
                "border border-border/50 hover:border-primary/30",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={disabled || isUploading}
            title="Hold to record voice message"
        >
            {isUploading ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
                <Mic className="h-5 w-5 text-primary" />
            )}
        </Button>
    );
}

