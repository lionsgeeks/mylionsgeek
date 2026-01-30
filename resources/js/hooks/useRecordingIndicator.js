// Hook for recording indicator - real-time audio recording status
// Hook bach n3rfo ila user kayrecord audio wla la

import { publishToChannel, subscribeToChannel, unsubscribeFromChannel } from '@/lib/ablyManager';
import { useCallback, useEffect, useState } from 'react';

export const useRecordingIndicator = (channelName, currentUserId, isActive = true) => {
    const [recordingUsers, setRecordingUsers] = useState(new Set());

    // Publish recording event
    const startRecordingIndicator = useCallback(() => {
        if (!isActive) return;

        publishToChannel(channelName, 'recording', {
            user_id: currentUserId,
            is_recording: true,
        }).catch((err) => console.error('Failed to publish recording start:', err));
    }, [channelName, currentUserId, isActive]);

    // Stop recording event
    const stopRecordingIndicator = useCallback(() => {
        if (!isActive) return;

        publishToChannel(channelName, 'recording', {
            user_id: currentUserId,
            is_recording: false,
        }).catch((err) => console.error('Failed to publish recording stop:', err));
    }, [channelName, currentUserId, isActive]);

    // Subscribe to recording events
    useEffect(() => {
        if (!isActive) return;

        const handleRecording = (data) => {
            // Ignore own recording events
            if (data.user_id === currentUserId) return;

            setRecordingUsers((prev) => {
                const newSet = new Set(prev);

                if (data.is_recording) {
                    newSet.add(data.user_id);
                } else {
                    newSet.delete(data.user_id);
                }

                return newSet;
            });
        };

        subscribeToChannel(channelName, 'recording', handleRecording);

        return () => {
            stopRecordingIndicator();
            unsubscribeFromChannel(channelName, 'recording', handleRecording);
        };
    }, [channelName, currentUserId, isActive, stopRecordingIndicator]);

    return {
        recordingUsers: Array.from(recordingUsers),
        startRecordingIndicator,
        stopRecordingIndicator,
        isRecording: recordingUsers.size > 0,
    };
};
