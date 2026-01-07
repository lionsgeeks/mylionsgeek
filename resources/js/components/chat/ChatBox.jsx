import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import useAblyChannel from '@/hooks/useAblyChannel';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useRecordingIndicator } from '@/hooks/useRecordingIndicator';
import { publishToChannel } from '@/lib/ablyManager';
import { showDesktopNotification, requestNotificationPermission, hasNotificationPermission } from '@/lib/notificationManager';
import ChatHeader from './partials/ChatHeader';
import MessageList from './partials/MessageList';
import MessageInput from './partials/MessageInput';
import PreviewPanel from './partials/PreviewPanel';
import ChatToolbox from './partials/ChatToolbox';
import TypingIndicator from './partials/TypingIndicator';
import RecordingIndicator from './partials/RecordingIndicator';

// Main ChatBox component - refactored b components so9or
export default function ChatBox({ conversation, onClose, onBack, isExpanded, onExpand }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [messages, setMessages] = useState(conversation.messages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(null);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [audioProgress, setAudioProgress] = useState({});
    const [audioDuration, setAudioDuration] = useState({});
    const [showMenuForMessage, setShowMenuForMessage] = useState(null);
    const [showToolbox, setShowToolbox] = useState(false);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const chunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const recordingTimerRef = useRef(null);
    const pendingTempIdsRef = useRef(new Set());

    const channelName = `chat:conversation:${conversation.id}`;
    
    // Real-time messaging with Ably - Tssma3 3la channel dial conversation
    const { isConnected, subscribe, publish } = useAblyChannel(
        channelName,
        ['new-message', 'message-deleted', 'seen', 'typing', 'recording'],
        {
            onConnected: () => {
                //console.log('Ably connected for conversation:', conversation.id);
                // Request notification permission on first connection
                requestNotificationPermission();
            },
            onError: (error) => {
                console.error('Ably connection error:', error);
            },
        }
    );

    // Typing indicator
    const { typingUsers, startTyping, stopTyping } = useTypingIndicator(channelName, currentUser.id, isConnected);
    
    // Recording indicator
    const { recordingUsers, startRecordingIndicator, stopRecordingIndicator } = useRecordingIndicator(channelName, currentUser.id, isConnected);
    
    // Real-time seen status
    const [seenStatus, setSeenStatus] = useState({});

    // Subscribe to real-time message events
    useEffect(() => {
        if (!isConnected) return;

        // Handle new messages from other users
        const handleNewMessage = (messageData) => {
            const isFromOtherUser = messageData.sender_id !== currentUser.id;
            
            // Show notification if chatbox is closed or minimized
            if (isFromOtherUser) {
                // Desktop notification
                if (hasNotificationPermission() && (document.hidden || !document.hasFocus())) {
                    //console.log(messageData);
                    showDesktopNotification(
                        `${messageData.sender?.name || 'New message'}`,
                        {
                            body: messageData.body || '📎 Attachment',
                            icon:"storage/img/profile/" +  messageData.sender?.image || '/favicon.ico',
                            tag: `chat-${conversation.id}`,
                            data: {
                                conversationId: conversation.id,
                                userId: messageData.sender_id,
                            },
                        }
                    );
                }

                // Toast notifications are handled globally - no need to show here
                // Global listener will handle showing toasts unconditionally
            }

            // Check if message already exists (avoid duplicates)
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === messageData.id);
                if (exists) return prev;

                // Check if it's a pending message that was just sent
                const isPending = prev.some(msg => 
                    msg.tempId && pendingTempIdsRef.current.has(msg.tempId) &&
                    msg.sender_id === messageData.sender_id
                );
                
                // If we have a pending message, replace it with the real one
                if (isPending) {
                    const filtered = prev.filter(msg => 
                        !msg.tempId || !pendingTempIdsRef.current.has(msg.tempId)
                    );
                    // Clean up temp IDs for this sender
                    pendingTempIdsRef.current.forEach(tempId => {
                        const msg = prev.find(m => m.tempId === tempId);
                        if (msg && msg.sender_id === messageData.sender_id) {
                            pendingTempIdsRef.current.delete(tempId);
                        }
                    });
                    return [...filtered, {
                        ...messageData,
                        sender: messageData.sender || {
                            id: messageData.sender_id,
                            name: '',
                            image: '',
                        }
                    }];
                }

                // Add new message from other user
                return [...prev, {
                    ...messageData,
                    sender: messageData.sender || {
                        id: messageData.sender_id,
                        name: '',
                        image: '',
                    }
                }];
            });

            // Mark as read if message is from other user and chatbox is visible and focused
            // This will broadcast seen status via Ably automatically
            if (isFromOtherUser && !document.hidden && document.hasFocus()) {
                fetch(`/chat/conversation/${conversation.id}/read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                }).catch(err => console.error('Failed to mark as read:', err));
            }

            scrollToBottom();
        };

        // Handle message deletions
        const handleMessageDeleted = (data) => {
            setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
        };

        // Handle seen status updates
        const handleSeen = (data) => {
            if (data.user_id !== currentUser.id) {
                setSeenStatus(prev => ({
                    ...prev,
                    [conversation.id]: {
                        read_at: data.read_at,
                        user_id: data.user_id,
                    },
                }));

                // Update message read status
                setMessages(prev => prev.map(msg => {
                    if (msg.sender_id === currentUser.id && !msg.is_read) {
                        return {
                            ...msg,
                            is_read: true,
                            read_at: data.read_at,
                        };
                    }
                    return msg;
                }));
            }
        };

        subscribe('new-message', handleNewMessage);
        subscribe('message-deleted', handleMessageDeleted);
        subscribe('seen', handleSeen);

        return () => {
            // Cleanup handled by useAblyChannel
        };
    }, [isConnected, subscribe, conversation.id, currentUser.id]);

    // Fetch messages - b3d ma y3tiw 3la conversation
    useEffect(() => {
        fetchMessages();
    }, [conversation.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update recording time timer
    useEffect(() => {
        if (isRecording && !isPaused) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
        
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording, isPaused]);

    // Load audio durations when messages change
    useEffect(() => {
        messages.forEach(message => {
            if (message.attachment_type === 'audio' && message.attachment_path && !audioDuration[message.id]) {
                const audio = document.getElementById(`audio-${message.id}`);
                if (audio) {
                    const loadDuration = () => {
                        if (audio.duration && isFinite(audio.duration)) {
                            setAudioDuration(prev => ({ ...prev, [message.id]: audio.duration }));
                        }
                    };
                    
                    if (audio.readyState >= 1) {
                        loadDuration();
                    } else {
                        audio.addEventListener('loadedmetadata', loadDuration, { once: true });
                        audio.load();
                    }
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/chat/conversation/${conversation.id}/messages`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            const fetchedMessages = data.messages || [];

            // Merge m3a pending messages (optimistic updates) - b7al b9a send
            setMessages(prev => {
                // Jib pending messages li mazal ma jawawoch
                const pendingMessages = prev.filter(m => m.pending && pendingTempIdsRef.current.has(m.tempId));
                const existingIds = new Set(fetchedMessages.map(m => m.id));
                
                // Filter pending li jawawoch (dakhalo f fetchedMessages)
                const stillPending = pendingMessages.filter(m => !existingIds.has(m.tempId));
                
                // Merge fetched w pending
                return [...fetchedMessages, ...stillPending];
            });

            // Mark as read
            await fetch(`/chat/conversation/${conversation.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
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
            // Check if MediaRecorder is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('MediaRecorder API is not supported in this browser');
            }

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                } 
            });
            
            // Store stream reference
            audioStreamRef.current = stream;
            
            // Check if MediaRecorder is available
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder is not supported in this browser');
            }

            // Determine best mime type
            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    mimeType = 'audio/mp4';
                } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                    mimeType = 'audio/ogg';
                } else {
                    mimeType = ''; // Use default
                }
            }

            const mediaRecorder = mimeType 
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (chunksRef.current.length > 0) {
                    const blobType = mimeType || (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');
                    const blob = new Blob(chunksRef.current, { type: blobType });
                    setAudioBlob(blob);
                    const url = URL.createObjectURL(blob);
                    setAudioURL(url);
                    
                    // Calculate audio duration from blob
                    const audio = new Audio(url);
                    audio.addEventListener('loadedmetadata', () => {
                        if (audio.duration && isFinite(audio.duration)) {
                            // Store duration for preview
                            setAudioDuration(prev => ({ ...prev, 'preview': audio.duration }));
                        }
                    });
                    audio.load();
                }
                
                // Stop all tracks
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => {
                        track.stop();
                    });
                    audioStreamRef.current = null;
                }
                
                // Stop recording indicator
                if (stopRecordingIndicator) {
                    stopRecordingIndicator();
                }
            };

            mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                setIsRecording(false);
                setIsPaused(false);
                
                // Clean up stream
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                }
                
                stopRecordingIndicator();
            };

            // Start recording with timeslice for data chunks
            mediaRecorder.start(1000); // Get data every second
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            chunksRef.current = [];
            
            // Start recording indicator
            if (startRecordingIndicator) {
                startRecordingIndicator();
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
            
            let errorMessage = 'Failed to access microphone. ';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Please allow microphone access in your browser settings.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No microphone found. Please connect a microphone.';
            } else {
                errorMessage += error.message || 'Unknown error occurred.';
            }
            
            alert(errorMessage);
            setIsRecording(false);
            setIsPaused(false);
            
            // Stop recording indicator if function exists
            if (stopRecordingIndicator) {
                stopRecordingIndicator();
            }
            
            // Clean up any partial stream
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            if (mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            if (mediaRecorderRef.current.state === 'paused') {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            stopRecordingIndicator();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
            setIsRecording(false);
            setIsPaused(false);
            setAudioBlob(null);
            setAudioURL(null);
            setRecordingTime(0);
            chunksRef.current = [];
            stopRecordingIndicator();
            setAudioDuration(prev => {
                const newState = { ...prev };
                delete newState['preview'];
                return newState;
            });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment && !audioBlob) || sending) return;

        const messageBody = newMessage.trim();
        const tempId = Date.now();
        pendingTempIdsRef.current.add(tempId);
        
        // Create optimistic message bach yban b7al b9a send (pending status)
        const optimisticMessage = {
            id: tempId,
            tempId: tempId,
            pending: true,
            body: messageBody,
            sender_id: currentUser.id,
            sender: {
                id: currentUser.id,
                name: currentUser.name,
                image: currentUser.image,
            },
            attachment_path: null,
            attachment_type: null,
            attachment_name: null,
            attachment_size: null,
            is_read: false,
            read_at: null,
            created_at: new Date().toISOString(),
        };

        // Add attachment preview if exists
        if (attachment) {
            const attachmentURL = URL.createObjectURL(attachment);
            optimisticMessage.attachment_path = attachmentURL;
            optimisticMessage.attachment_name = attachment.name;
            optimisticMessage.attachment_size = attachment.size;
            
            if (attachment.type.startsWith('image/')) {
                optimisticMessage.attachment_type = 'image';
            } else if (attachment.type.startsWith('video/')) {
                optimisticMessage.attachment_type = 'video';
            } else {
                optimisticMessage.attachment_type = 'file';
            }
        }

        if (audioBlob) {
            optimisticMessage.attachment_path = audioURL;
            optimisticMessage.attachment_type = 'audio';
            optimisticMessage.attachment_name = 'voice-message.webm';
            optimisticMessage.attachment_size = audioBlob.size;
            // Use preview duration if available
            if (audioDuration['preview']) {
                optimisticMessage.audio_duration = audioDuration['preview'];
            }
        }

        // Zwid message m9bl ma yban b7al send (optimistic)
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToBottom();

        // Save form data before clearing
        const formMessageBody = messageBody;
        const formAttachment = attachment;
        const formAudioBlob = audioBlob;
        const prevAudioURL = audioURL;
        
        // Clear form
        setNewMessage('');
        setAttachment(null);
        setAudioBlob(null);
        setAudioURL(null);
        setRecordingTime(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Prepare FormData for sending
        setSending(true);
        const formData = new FormData();
        formData.append('body', formMessageBody);
        formData.append('_token', getCsrfToken());
        
        if (formAttachment) {
            formData.append('attachment', formAttachment);
            const attachmentType = formAttachment.type.startsWith('image/') ? 'image' 
                : formAttachment.type.startsWith('video/') ? 'video' 
                : 'file';
            formData.append('attachment_type', attachmentType);
        }
        
        if (formAudioBlob) {
            formData.append('attachment', formAudioBlob, 'audio.webm');
            formData.append('attachment_type', 'audio');
        }

        try {
            const response = await fetch(`/chat/conversation/${conversation.id}/send`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }));
                throw new Error(errorData.error || 'Failed to send message');
            }

            const data = await response.json();
            const newMessageData = data.message;

            // Replace optimistic message with real one
            setMessages(prev => {
                // Remove optimistic message
                const filtered = prev.filter(msg => msg.tempId !== tempId);
                // Add real message (avoid duplicates)
                const exists = filtered.some(msg => msg.id === newMessageData.id);
                if (!exists) {
                    return [...filtered, {
                        ...newMessageData,
                        sender: newMessageData.sender || {
                            id: currentUser.id,
                            name: currentUser.name,
                            image: currentUser.image,
                        }
                    }];
                }
                return filtered;
            });

            // Clean up temp ID
            pendingTempIdsRef.current.delete(tempId);
            
            // Clean up audio URL if it was a blob
            if (prevAudioURL && prevAudioURL.startsWith('blob:')) {
                URL.revokeObjectURL(prevAudioURL);
            }

            scrollToBottom();
        } catch (error) {
            // 7yed failed optimistic message
            setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
            pendingTempIdsRef.current.delete(tempId);
            alert(error.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
            // Clean up preview duration
            setAudioDuration(prev => {
                const newState = { ...prev };
                delete newState['preview'];
                return newState;
            });
        }
    };

    // Format message time - static (no real-time updates)
    const formatMessageTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'few seconds ago';
        if (diffMins < 60) return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
        if (diffHours < 24 && isToday(date)) return format(date, 'h:mm a');
        if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
        if (diffDays < 7) return format(date, 'EEEE');
        return format(date, 'MMM d, yyyy');
    };

    const formatSeenTime = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isToday(date)) return `Seen today at ${format(date, 'h:mm a')}`;
        if (isYesterday(date)) return `Seen yesterday at ${format(date, 'h:mm a')}`;
        return `Seen ${format(date, 'MMM d')}`;
    };

    const handlePlayAudio = (audioPath, messageId) => {
        if (isPlayingAudio === messageId) {
            const audio = document.getElementById(`audio-${messageId}`);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlayingAudio(null);
                setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
            }
        } else {
            if (isPlayingAudio) {
                const currentAudio = document.getElementById(`audio-${isPlayingAudio}`);
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                setAudioProgress(prev => ({ ...prev, [isPlayingAudio]: 0 }));
            }
            
            setIsPlayingAudio(messageId);
            setTimeout(() => {
                const audio = document.getElementById(`audio-${messageId}`);
                if (audio) {
                    // Jib duration dyal audio
                    const loadDuration = () => {
                        if (audio.duration && isFinite(audio.duration)) {
                            setAudioDuration(prev => ({ ...prev, [messageId]: audio.duration }));
                        }
                    };
                    
                    // Check ila duration kayna b9a
                    if (audio.readyState >= 1) {
                        loadDuration();
                    } else {
                        audio.addEventListener('loadedmetadata', loadDuration, { once: true });
                    }
                    
                    audio.play();
                    
                    const updateProgress = () => {
                        if (audio.duration) {
                            const percent = (audio.currentTime / audio.duration) * 100;
                            setAudioProgress(prev => ({ ...prev, [messageId]: percent }));
                        }
                    };
                    
                    audio.addEventListener('timeupdate', updateProgress);
                    audio.onended = () => {
                        setIsPlayingAudio(null);
                        setAudioProgress(prev => ({ ...prev, [messageId]: 100 }));
                        audio.removeEventListener('timeupdate', updateProgress);
                    };
                    audio.onerror = () => {
                        setIsPlayingAudio(null);
                        setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
                        alert('Failed to play audio');
                        audio.removeEventListener('timeupdate', updateProgress);
                    };
                }
            }, 100);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            const response = await fetch(`/chat/message/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error) {
            alert(error.message || 'Failed to delete message');
        }
    };

    const handleDownloadAttachment = (attachmentPath, attachmentName) => {
        const url = attachmentPath.startsWith('/storage/') ? attachmentPath : `/storage/${attachmentPath}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = attachmentName || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getAttachmentsForPreview = () => {
        return messages.filter(m => m.attachment_path && ['image', 'video'].includes(m.attachment_type))
            .map(m => ({ type: m.attachment_type, path: m.attachment_path, name: m.attachment_name }));
    };

    const handlePreviewAttachment = (att) => {
        const all = getAttachmentsForPreview();
        const idx = all.findIndex(a => a.path === att.path);
        setPreviewIndex(idx >= 0 ? idx : 0);
        setPreviewAttachment(all[idx >= 0 ? idx : 0]);
        setShowToolbox(false);
    };

    const handleNextPreview = () => {
        const all = getAttachmentsForPreview();
        if (all.length > 0) {
            const nextIndex = (previewIndex + 1) % all.length;
            setPreviewIndex(nextIndex);
            setPreviewAttachment(all[nextIndex]);
        }
    };

    const handlePreviousPreview = () => {
        const all = getAttachmentsForPreview();
        if (all.length > 0) {
            const prevIndex = (previewIndex - 1 + all.length) % all.length;
            setPreviewIndex(prevIndex);
            setPreviewAttachment(all[prevIndex]);
        }
    };

    const allAttachments = getAttachmentsForPreview();
    const hasMultipleAttachments = allAttachments.length > 1;

    return (
        <div className="bg-background flex h-full overflow-hidden relative">
            {/* Main Chat Area */}
            <div className={cn("flex flex-col h-full transition-all duration-300 w-full", previewAttachment && "opacity-0 pointer-events-none")}>
                <ChatHeader 
                    conversation={conversation}
                    onClose={showToolbox ? () => setShowToolbox(false) : onClose}
                    onBack={onBack}
                    onToolboxToggle={() => setShowToolbox(!showToolbox)}
                />

                <div className="flex-1 min-h-0 flex overflow-hidden">
                    <MessageList
                        messages={messages}
                        loading={loading}
                        currentUser={currentUser}
                        conversation={conversation}
                        isPlayingAudio={isPlayingAudio}
                        audioProgress={audioProgress}
                        audioDuration={audioDuration}
                        showMenuForMessage={showMenuForMessage}
                        onPlayAudio={handlePlayAudio}
                        onDeleteMessage={handleDeleteMessage}
                        onMenuToggle={setShowMenuForMessage}
                        onPreviewAttachment={handlePreviewAttachment}
                        onDownloadAttachment={handleDownloadAttachment}
                        formatMessageTime={formatMessageTime}
                        formatSeenTime={formatSeenTime}
                        messagesEndRef={messagesEndRef}
                        showToolbox={showToolbox}
                        previewAttachment={previewAttachment}
                        typingUsers={typingUsers}
                        recordingUsers={recordingUsers}
                    />
                    
                    {/* Toolbox f right side dial messages */}
                    {showToolbox && !previewAttachment && (
                        <div className="w-full border-l flex-shrink-0">
                            <ChatToolbox 
                                conversationId={conversation.id}
                                otherUserId={conversation.other_user.id}
                                onPreviewAttachment={handlePreviewAttachment}
                                messages={messages}
                            />
                        </div>
                    )}
                </div>

                <MessageInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    sending={sending}
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    audioBlob={audioBlob}
                    audioURL={audioURL}
                    setAudioBlob={setAudioBlob}
                    setAudioURL={setAudioURL}
                    mediaRecorderRef={mediaRecorderRef}
                    fileInputRef={fileInputRef}
                    handleFileSelect={handleFileSelect}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    cancelRecording={cancelRecording}
                    handleSendMessage={handleSendMessage}
                    isExpanded={isExpanded}
                    audioDuration={audioDuration['preview']}
                    onTypingStart={startTyping}
                    onTypingStop={stopTyping}
                    onPause={pauseRecording}
                    onResume={resumeRecording}
                />
            </div>

            {/* Preview Panel - Full Width */}
            {previewAttachment && (
                <div className="absolute inset-0 z-50 bg-background flex flex-col">
                    <PreviewPanel
                        attachment={previewAttachment}
                        onClose={() => setPreviewAttachment(null)}
                        onPrevious={handlePreviousPreview}
                        onNext={handleNextPreview}
                        hasMultiple={hasMultipleAttachments}
                        currentIndex={previewIndex}
                        totalCount={allAttachments.length}
                    />
                </div>
            )}
        </div>
    );
}
