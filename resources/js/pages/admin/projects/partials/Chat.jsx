import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
// Removed ScrollArea import - using native scroll with hidden scrollbar
import VoiceMessage from '@/components/chat/VoiceMessage';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useAblyChannel from '@/hooks/useAblyChannel';
import { cn } from '@/lib/utils';
import { Check, Edit2, MessageSquare, Reply, Send, Smile, Trash2, X, XCircle } from 'lucide-react';

const Chat = ({ projectId, messages: initialMessages = [], onChatOpen, unreadCount = 0 }) => {
    const page = usePage();
    const { auth } = page.props;
    const currentUserId = auth?.user?.id;
    const [chatOpen, setChatOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages);
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const scrollAreaRef = useRef(null);
    const messagesEndRef = useRef(null);

    const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

    // Subscribe to real-time messages via Ably
    const channelName = projectId ? `project:${projectId}` : null;

    const { isConnected, subscribe } = useAblyChannel(
        channelName || 'project:placeholder',
        ['new-message', 'message-reaction-updated', 'message-updated', 'message-deleted'],
        {
            onConnected: () => {
                if (projectId) {
                    //console.log('✅ Connected to project chat channel:', channelName);
                }
            },
            onError: (error) => {
                console.error('❌ Ably connection error:', error);
            },
        },
    );

    // Fetch initial messages
    useEffect(() => {
        if (projectId) {
            fetch(`/admin/projects/${projectId}/messages`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.messages) {
                        setMessages(data.messages);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch messages:', error);
                });
        }
    }, [projectId]);

    // Subscribe to new messages and reaction updates - register callbacks immediately
    useEffect(() => {
        if (!subscribe || !projectId) return;

        const handleNewMessage = (data) => {
            //console.log('📨 Received new message via Ably:', data);
            // Check if message already exists to prevent duplicates
            setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === data.id);
                if (exists) {
                    //console.log('⚠️ Duplicate message detected, skipping');
                    return prev;
                }
                //console.log('✅ Adding new message to chat');
                // Ensure reactions is always an array
                return [
                    ...prev,
                    {
                        ...data,
                        reactions: data.reactions || [],
                        attachment_path: data.attachment_path || null,
                        attachment_type: data.attachment_type || null,
                        attachment_name: data.attachment_name || null,
                        audio_duration: data.audio_duration || null,
                    },
                ];
            });
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        const handleReactionUpdate = (data) => {
            //console.log('📨 Received reaction update via Ably (real-time for all users):', data);
            if (!data || !data.message_id) {
                console.warn('⚠️ Invalid reaction update data:', data);
                return;
            }

            setMessages((prev) => {
                // Convert message_id to number for comparison (in case it's a string)
                const targetMessageId = Number(data.message_id);
                const messageExists = prev.some((msg) => Number(msg.id) === targetMessageId);

                if (!messageExists) {
                    console.warn(
                        '⚠️ Reaction update received for non-existent message:',
                        targetMessageId,
                        '- Available message IDs:',
                        prev.map((m) => m.id),
                    );
                    return prev;
                }

                const updated = prev.map((msg) => {
                    //console.log('✅ Updating reactions for message:', data.message_id, 'New reactions:', data.reactions);
                    if (Number(msg.id) === targetMessageId) {
                        const reactionsArray = Array.isArray(data.reactions) ? data.reactions : [];
                        console.log('✅ Updating reactions for message:', targetMessageId, 'New reactions:', reactionsArray);
                        return {
                            ...msg,
                            reactions: reactionsArray,
                        };
                    }
                    return msg;
                });

                console.log('✅ Reactions updated in real-time');
                return updated;
            });
        };

        const handleMessageUpdate = (data) => {
            //console.log('📨 Received message update via Ably:', data);
            setMessages((prev) => {
                const updated = prev.map((msg) =>
                    msg.id === data.id
                        ? {
                              ...msg,
                              content: data.content,
                              timestamp: data.timestamp,
                              updated_at: data.updated_at,
                              reactions: data.reactions || [],
                              reply_to: data.reply_to,
                              attachment_path: data.attachment_path || msg.attachment_path,
                              attachment_type: data.attachment_type || msg.attachment_type,
                              attachment_name: data.attachment_name || msg.attachment_name,
                              audio_duration: data.audio_duration || msg.audio_duration,
                          }
                        : msg,
                );
                const found = prev.find((msg) => msg.id === data.id);
                if (found) {
                    //console.log('✅ Message updated in real-time');
                }
                return updated;
            });
            // Cancel edit mode if editing this message
            if (editingMessage?.id === data.id) {
                //console.log('🔄 Cancelling edit mode after real-time update');
                setEditingMessage(null);
                setEditContent('');
                setIsEditing(false);
            }
        };

        const handleMessageDelete = (data) => {
            //console.log('📨 Received message deletion via Ably (real-time for all users):', data);
            if (!data || !data.message_id) {
                console.warn('⚠️ Invalid deletion data:', data);
                return;
            }

            setMessages((prev) => {
                const messageExists = prev.some((msg) => msg.id === data.message_id);
                if (!messageExists) {
                    //console.log('ℹ️ Message already deleted or not found:', data.message_id, '- may have been optimistically deleted');
                    return prev; // Message already deleted (optimistic update)
                }
                const filtered = prev.filter((msg) => msg.id !== data.message_id);
                //console.log('✅ Message deleted in real-time - synced for all users');
                return filtered;
            });

            // Cancel edit mode if editing this message
            if (editingMessage?.id === data.message_id) {
                //console.log('🔄 Cancelling edit mode after message deletion');
                setEditingMessage(null);
                setEditContent('');
                setIsEditing(false);
            }
        };

        // Register the callbacks for real-time updates
        //console.log('📡 Registering Ably event handlers for real-time updates');
        subscribe('new-message', handleNewMessage);
        subscribe('message-reaction-updated', handleReactionUpdate);
        subscribe('message-updated', handleMessageUpdate);
        subscribe('message-deleted', handleMessageDelete);
        //console.log('✅ All real-time event handlers registered');

        // Cleanup
        return () => {
            // The hook handles cleanup, but we can add additional cleanup if needed
        };
    }, [subscribe, projectId, editingMessage]);

    // Auto-scroll to bottom when chat opens or messages change
    useEffect(() => {
        if (chatOpen && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [chatOpen, messages]);

    const [audioBlob, setAudioBlob] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const voiceRecorderRef = useRef(null);
    const audioBlobReadyRef = useRef(false);
    const audioBlobPromiseRef = useRef(null);

    const handleRecordingComplete = async (blob, duration, mimeType) => {
        console.log('Chat: handleRecordingComplete called', {
            blobSize: blob.size,
            duration,
            mimeType,
        });

        if (!blob || blob.size === 0) {
            console.error('Invalid audio blob');
            if (audioBlobPromiseRef.current) {
                audioBlobPromiseRef.current.reject(new Error('Invalid audio blob'));
                audioBlobPromiseRef.current = null;
            }
            return;
        }

        // Ensure duration is a valid integer
        let validDuration = Math.round(duration || 1);
        if (!isFinite(validDuration) || validDuration <= 0 || validDuration > 600) {
            console.warn('Invalid duration, using fallback:', validDuration);
            validDuration = 1; // Minimum 1 second
        }

        console.log('Using duration:', validDuration);

        // Store the audio blob and duration
        setAudioBlob(blob);
        setAudioDuration(validDuration);
        audioBlobReadyRef.current = true;

        // Resolve the promise if waiting
        if (audioBlobPromiseRef.current) {
            audioBlobPromiseRef.current.resolve({ blob, duration: validDuration });
            audioBlobPromiseRef.current = null;
        }
    };

    const handleRecordingCancel = () => {
        setAudioBlob(null);
        setAudioDuration(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📤 Send button clicked', {
            projectId,
            isSending,
            hasText: !!newMessage.trim(),
            hasAudio: !!audioBlob,
            isRecording: voiceRecorderRef.current?.isRecording,
            canSend: voiceRecorderRef.current?.canSend,
        });

        if (!projectId || isSending) {
            console.log('❌ Cannot send: missing projectId or already sending');
            return;
        }

        // If recording, stop recording first and wait for blob
        let recordedAudio = null;
        let recordedDuration = 0;

        if (voiceRecorderRef.current?.isRecording && voiceRecorderRef.current?.canSend) {
            console.log('📤 Send clicked during recording - stopping first...');
            audioBlobReadyRef.current = false;

            // Create a promise to wait for the blob
            let resolvePromise, rejectPromise;
            const blobPromise = new Promise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            audioBlobPromiseRef.current = { resolve: resolvePromise, reject: rejectPromise };

            if (voiceRecorderRef.current.stopAndSend) {
                voiceRecorderRef.current.stopAndSend();

                // Wait for blob with timeout
                try {
                    const result = await Promise.race([
                        blobPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for audio')), 3000)),
                    ]);
                    recordedAudio = result.blob;
                    recordedDuration = result.duration;
                    console.log('✅ Audio blob ready:', { size: recordedAudio.size, duration: recordedDuration });
                } catch (err) {
                    console.error('❌ Failed to get audio blob:', err);
                    audioBlobPromiseRef.current = null;
                    return;
                }
            } else {
                console.error('❌ stopAndSend function not available');
                return;
            }
        }

        // Get current values
        const content = newMessage.trim();
        const audio = recordedAudio || audioBlob;
        const duration = recordedDuration || audioDuration;
        const replyId = replyingTo?.id;

        console.log('📦 Preparing to send:', {
            hasContent: !!content,
            hasAudio: !!audio,
            contentLength: content.length,
            audioSize: audio?.size,
        });

        // Check if we have something to send
        if (!content && !audio) {
            console.log('❌ Nothing to send');
            return;
        }

        // Clear inputs
        setNewMessage('');
        setAudioBlob(null);
        setAudioDuration(0);
        setReplyingTo(null);
        audioBlobReadyRef.current = false;
        setIsSending(true);

        try {
            const formData = new FormData();

            // Always send content, even if empty (backend requires either content or audio)
            formData.append('content', content || '');

            if (audio) {
                let extension = 'webm';
                const blobType = audio.type || '';
                if (blobType.includes('mp4') || blobType.includes('m4a')) {
                    extension = 'm4a';
                } else if (blobType.includes('mp3')) {
                    extension = 'mp3';
                } else if (blobType.includes('ogg')) {
                    extension = 'ogg';
                } else if (blobType.includes('wav')) {
                    extension = 'wav';
                }
                formData.append('audio', audio, `voice_message.${extension}`);
                formData.append('audio_duration', duration || 1);
            }

            if (replyId) {
                formData.append('reply_to', replyId);
            }

            console.log('📤 FormData prepared:', {
                hasContent: formData.has('content'),
                contentValue: content || '(empty)',
                hasAudio: formData.has('audio'),
                hasDuration: formData.has('audio_duration'),
                duration: duration || 1,
            });

            console.log('📤 Sending message...', { hasContent: !!content, hasAudio: !!audio });

            const response = await fetch(`/admin/projects/${projectId}/messages`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to send message');
            }

            console.log('✅ Message sent successfully');
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            // Restore on error
            setNewMessage(content);
            if (audio) {
                setAudioBlob(audio);
                setAudioDuration(duration);
                audioBlobReadyRef.current = true;
            }
            if (replyingTo) {
                setReplyingTo(replyingTo);
            }
            alert('Failed to send: ' + error.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setEditContent(message.content);
        setIsEditing(false); // Reset saving state
        setReplyingTo(null);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditContent('');
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || !projectId || !editingMessage || isEditing) {
            // console.log('⚠️ Cannot save edit:', {
            //     hasContent: !!editContent.trim(),
            //     hasProjectId: !!projectId,
            //     hasEditingMessage: !!editingMessage,
            //     isEditing
            // });
            return;
        }

        const content = editContent.trim();
        const messageId = editingMessage.id;
        //console.log('💾 Saving message edit:', { messageId, content });
        setIsEditing(true);

        // Optimistically update the UI
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: content, updated_at: new Date().toISOString() } : msg)));

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Failed to update message:', errorData);
                throw new Error(errorData.error || 'Failed to update message');
            }

            const result = await response.json();
            //console.log('✅ Message updated successfully:', result);

            // Close edit mode - real-time update will sync the final state
            setEditingMessage(null);
            setEditContent('');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update message:', error);
            // Revert optimistic update on error - refetch messages
            if (projectId) {
                fetch(`/admin/projects/${projectId}/messages`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.messages) {
                            setMessages(data.messages);
                        }
                    })
                    .catch((err) => {
                        console.error('Failed to refetch messages:', err);
                    });
            }
            setIsEditing(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!projectId || !messageId) return;

        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        //console.log('🗑️ Deleting message:', messageId);

        // Optimistically remove the message from UI for immediate feedback
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        // Cancel edit mode if editing this message
        if (editingMessage?.id === messageId) {
            setEditingMessage(null);
            setEditContent('');
            setIsEditing(false);
        }

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete message');
            }

            //console.log('✅ Message deleted successfully - real-time update will sync for all users');
            // Real-time update will sync the deletion across all clients via Ably
        } catch (error) {
            console.error('Failed to delete message:', error);
            // Revert optimistic update on error - refetch messages
            if (projectId) {
                fetch(`/admin/projects/${projectId}/messages`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.messages) {
                            setMessages(data.messages);
                        }
                    })
                    .catch((err) => {
                        console.error('Failed to refetch messages:', err);
                    });
            }
        }
    };

    const handleToggleReaction = async (messageId, reaction) => {
        if (!projectId) return;

        //console.log('👍 Toggling reaction:', { messageId, reaction, userId: auth?.user?.id });

        // Optimistically update the UI for immediate feedback
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id !== messageId) return msg;

                const currentReactions = msg.reactions || [];
                const reactionIndex = currentReactions.findIndex((r) => r.reaction === reaction);
                const userReacted = reactionIndex >= 0 && currentReactions[reactionIndex].users?.includes(auth?.user?.name);

                let updatedReactions;
                if (userReacted) {
                    // Remove reaction
                    updatedReactions = currentReactions
                        .map((r) => {
                            if (r.reaction === reaction) {
                                const newUsers = r.users.filter((u) => u !== auth?.user?.name);
                                if (newUsers.length === 0) {
                                    return null; // Remove this reaction group
                                }
                                return {
                                    ...r,
                                    count: newUsers.length,
                                    users: newUsers,
                                };
                            }
                            return r;
                        })
                        .filter(Boolean);
                } else {
                    // Add reaction - remove user's other reactions first
                    updatedReactions = currentReactions
                        .map((r) => ({
                            ...r,
                            users: r.users.filter((u) => u !== auth?.user?.name),
                            count: r.users.filter((u) => u !== auth?.user?.name).length,
                        }))
                        .filter((r) => r.count > 0);

                    // Add or update the new reaction
                    const existingReactionIndex = updatedReactions.findIndex((r) => r.reaction === reaction);
                    if (existingReactionIndex >= 0) {
                        updatedReactions[existingReactionIndex] = {
                            ...updatedReactions[existingReactionIndex],
                            count: updatedReactions[existingReactionIndex].count + 1,
                            users: [...updatedReactions[existingReactionIndex].users, auth?.user?.name],
                        };
                    } else {
                        updatedReactions.push({
                            reaction,
                            count: 1,
                            users: [auth?.user?.name],
                        });
                    }
                }

                return { ...msg, reactions: updatedReactions };
            }),
        );

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ reaction }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle reaction');
            }

            // Close reaction picker
            setShowReactionPicker(null);

            //console.log('✅ Reaction toggle successful - real-time update will sync for all users');
            // The real update will come via Ably and sync for all users
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
            // Revert optimistic update on error - refetch messages
            if (projectId) {
                fetch(`/admin/projects/${projectId}/messages`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.messages) {
                            setMessages(data.messages);
                        }
                    })
                    .catch((err) => {
                        console.error('Failed to refetch messages:', err);
                    });
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4">
            <Sheet open={chatOpen} onOpenChange={(open) => {
                setChatOpen(open);
                if (open && onChatOpen) {
                    onChatOpen();
                }
            }}>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-12 w-12 rounded-full shadow-lg relative">
                        <MessageSquare className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-background">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col bg-gradient-to-b from-background to-muted/20 p-0 lg:h-screen lg:w-1/3 xl:w-1/4">
                    <SheetHeader className="border-b border-border/50 bg-background/80 px-6 pt-6 pb-4 backdrop-blur-sm">
                        <SheetTitle className="text-xl font-semibold">Team Chat</SheetTitle>
                        <SheetDescription className="text-sm">Chat with your team members</SheetDescription>
                    </SheetHeader>
                    <div className="scrollbar-hide mt-2 mb-2 flex-1 overflow-y-auto px-4 lg:h-[calc(100vh-200px)]" ref={scrollAreaRef}>
                        <div className="space-y-3 pr-2 pb-2">
                            {messages.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((message) => {
                                    const isCurrentUser = message.user.id === currentUserId;
                                    return (
                                        <div key={message.id} className={cn('group flex gap-3', isCurrentUser ? 'flex-row-reverse' : 'flex-row')}>
                                            {!isCurrentUser && (
                                                <Avatar
                                                    className="h-8 w-8 flex-shrink-0"
                                                    image={message.user.avatar}
                                                    name={message.user.name}
                                                    onlineCircleClass="hidden"
                                                />
                                            )}
                                            <div className={cn('flex max-w-[75%] flex-col', isCurrentUser ? 'items-end' : 'items-start')}>
                                                {!isCurrentUser && (
                                                    <span className="mb-1 text-xs font-medium text-muted-foreground">{message.user.name}</span>
                                                )}
                                                {message.reply_to && (
                                                    <div
                                                        className={cn(
                                                            'mb-1 rounded border-l-2 p-2 text-xs',
                                                            isCurrentUser
                                                                ? 'border-primary bg-primary/10 text-primary-foreground/70'
                                                                : 'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
                                                        )}
                                                    >
                                                        <div className="font-medium">{message.reply_to.user.name}</div>
                                                        <div className="truncate">{message.reply_to.content}</div>
                                                    </div>
                                                )}
                                                {editingMessage?.id === message.id ? (
                                                    <div
                                                        className={cn(
                                                            'relative rounded-lg px-3 py-2 text-sm',
                                                            isCurrentUser
                                                                ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                                : 'rounded-bl-sm bg-muted',
                                                        )}
                                                    >
                                                        <Input
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSaveEdit();
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelEdit();
                                                                }
                                                            }}
                                                            className="bg-background text-foreground"
                                                            autoFocus
                                                        />
                                                        <div className="mt-2 flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={handleSaveEdit}
                                                                disabled={isEditing || !editContent.trim()}
                                                            >
                                                                <Check className="mr-1 h-3 w-3" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={handleCancelEdit}
                                                                disabled={isEditing}
                                                            >
                                                                <XCircle className="mr-1 h-3 w-3" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            'group/message-bubble relative rounded-xl px-4 py-3 text-sm transition-all duration-200',
                                                            'shadow-sm hover:shadow-md',
                                                            isCurrentUser
                                                                ? 'rounded-br-sm border border-primary/20 bg-gradient-to-br from-primary to-primary/95 text-primary-foreground'
                                                                : 'rounded-bl-sm border border-border/50 bg-gradient-to-br from-muted to-muted/80',
                                                        )}
                                                    >
                                                        {message.attachment_type === 'audio' && message.attachment_path ? (
                                                            <VoiceMessage
                                                                audioUrl={message.attachment_path}
                                                                duration={message.audio_duration}
                                                                isCurrentUser={isCurrentUser}
                                                            />
                                                        ) : (
                                                            message.content && (
                                                                <p className="leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                                                            )
                                                        )}
                                                        {message.updated_at && message.updated_at !== message.timestamp && (
                                                            <span
                                                                className={cn(
                                                                    'mt-1 block text-xs',
                                                                    isCurrentUser ? 'text-primary-foreground/50' : 'text-muted-foreground/70',
                                                                )}
                                                            >
                                                                (edited)
                                                            </span>
                                                        )}
                                                        <div
                                                            className={cn(
                                                                'mt-1.5 flex items-center gap-2',
                                                                isCurrentUser ? 'justify-end' : 'justify-start',
                                                            )}
                                                        >
                                                            {message.reactions &&
                                                                Array.isArray(message.reactions) &&
                                                                message.reactions.length > 0 && (
                                                                    <div
                                                                        className={cn('flex flex-wrap gap-1', isCurrentUser ? 'order-2' : 'order-1')}
                                                                    >
                                                                        {message.reactions.map((reactionGroup, idx) => {
                                                                            const userReacted =
                                                                                reactionGroup.users &&
                                                                                Array.isArray(reactionGroup.users) &&
                                                                                reactionGroup.users.includes(auth?.user?.name);
                                                                            return (
                                                                                <button
                                                                                    key={`${reactionGroup.reaction}-${idx}`}
                                                                                    onClick={() =>
                                                                                        handleToggleReaction(message.id, reactionGroup.reaction)
                                                                                    }
                                                                                    className={cn(
                                                                                        'flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all hover:scale-105',
                                                                                        userReacted
                                                                                            ? 'border-primary/50 bg-primary/20 text-primary shadow-sm'
                                                                                            : 'border-border bg-background hover:bg-muted',
                                                                                    )}
                                                                                    title={reactionGroup.users?.join(', ') || ''}
                                                                                >
                                                                                    <span className="text-sm">{reactionGroup.reaction}</span>
                                                                                    <span className="font-medium">{reactionGroup.count || 0}</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            <span
                                                                className={cn(
                                                                    'text-xs',
                                                                    isCurrentUser
                                                                        ? 'order-1 text-primary-foreground/70'
                                                                        : 'order-2 text-muted-foreground',
                                                                )}
                                                            >
                                                                {new Date(message.timestamp).toLocaleTimeString(undefined, {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    className={cn(
                                                        'mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
                                                        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
                                                    )}
                                                >
                                                    <Popover
                                                        open={showReactionPicker === message.id}
                                                        onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-muted"
                                                                title="Add reaction"
                                                            >
                                                                <Smile className="h-4 w-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-3" align={isCurrentUser ? 'end' : 'start'}>
                                                            <div className="flex gap-2">
                                                                {reactions.map((reaction) => {
                                                                    const hasReaction = message.reactions?.some(
                                                                        (r) => r.reaction === reaction && r.users?.includes(auth?.user?.name),
                                                                    );
                                                                    return (
                                                                        <button
                                                                            key={reaction}
                                                                            onClick={() => {
                                                                                handleToggleReaction(message.id, reaction);
                                                                                // Close picker after a short delay to allow the click to register
                                                                                setTimeout(() => setShowReactionPicker(null), 100);
                                                                            }}
                                                                            className={cn(
                                                                                'rounded p-2 text-2xl transition-transform hover:scale-125 hover:bg-muted',
                                                                                hasReaction && 'bg-primary/20 ring-2 ring-primary/30',
                                                                            )}
                                                                            title={reaction}
                                                                        >
                                                                            {reaction}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setReplyingTo(message)}>
                                                        <Reply className="h-3 w-3" />
                                                    </Button>
                                                    {isCurrentUser && editingMessage?.id !== message.id && message.attachment_type !== 'audio' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleEditMessage(message)}
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                onClick={() => handleDeleteMessage(message.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {isCurrentUser && (
                                                <Avatar
                                                    className="h-8 w-8 flex-shrink-0"
                                                    image={message.user.avatar}
                                                    name={message.user.name}
                                                    onlineCircleClass="hidden"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <SheetFooter className="flex-col gap-2 border-t border-border/50 bg-background/80 px-4 pt-2 pb-4 backdrop-blur-sm">
                        {replyingTo && (
                            <div className="flex w-full items-center justify-between rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-3 shadow-sm">
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground">Replying to {replyingTo.user.name}</div>
                                    <div className="truncate text-sm">{replyingTo.content}</div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setReplyingTo(null)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {voiceRecorderRef.current?.isRecording ? (
                            <VoiceRecorder
                                onRecordingComplete={handleRecordingComplete}
                                onCancel={handleRecordingCancel}
                                disabled={isSending}
                                onStopRecordingRef={voiceRecorderRef}
                                onSendAudioDirect={async (blob, duration, mimeType) => {
                                    console.log('🚀 onSendAudioDirect called - sending audio directly...', {
                                        blobSize: blob?.size,
                                        duration: duration,
                                        mimeType: mimeType,
                                    });

                                    // Clear any existing audio state first
                                    setAudioBlob(null);
                                    setAudioDuration(0);
                                    audioBlobReadyRef.current = false;

                                    // Send audio directly to chat
                                    const formData = new FormData();
                                    formData.append('content', '');

                                    let extension = 'webm';
                                    if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
                                        extension = 'm4a';
                                    } else if (mimeType.includes('mp3')) {
                                        extension = 'mp3';
                                    } else if (mimeType.includes('ogg')) {
                                        extension = 'ogg';
                                    } else if (mimeType.includes('wav')) {
                                        extension = 'wav';
                                    }

                                    formData.append('audio', blob, `voice_message.${extension}`);
                                    formData.append('audio_duration', duration || 1);

                                    if (replyingTo?.id) {
                                        formData.append('reply_to', replyingTo.id);
                                    }

                                    setIsSending(true);
                                    try {
                                        const response = await fetch(`/admin/projects/${projectId}/messages`, {
                                            method: 'POST',
                                            headers: {
                                                Accept: 'application/json',
                                                'X-Requested-With': 'XMLHttpRequest',
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                            },
                                            credentials: 'same-origin',
                                            body: formData,
                                        });

                                        if (!response.ok) {
                                            const errorData = await response.json().catch(() => ({}));
                                            throw new Error(errorData.error || 'Failed to send message');
                                        }

                                        console.log('✅ Audio sent successfully via onSendAudioDirect');
                                        setReplyingTo(null);
                                    } catch (error) {
                                        console.error('❌ Failed to send audio via onSendAudioDirect:', error);
                                        alert('Failed to send audio: ' + error.message);
                                    } finally {
                                        setIsSending(false);
                                    }
                                }}
                            />
                        ) : (
                            <form onSubmit={handleSubmit} className="flex w-full gap-2">
                                <VoiceRecorder
                                    onRecordingComplete={handleRecordingComplete}
                                    onCancel={handleRecordingCancel}
                                    disabled={isSending}
                                    onStopRecordingRef={voiceRecorderRef}
                                    onSendAudioDirect={async (blob, duration, mimeType) => {
                                        console.log('🚀 onSendAudioDirect called from idle state - sending audio directly...', {
                                            blobSize: blob?.size,
                                            duration: duration,
                                            mimeType: mimeType,
                                        });

                                        // Clear any existing audio state first
                                        setAudioBlob(null);
                                        setAudioDuration(0);
                                        audioBlobReadyRef.current = false;

                                        // Send audio directly to chat
                                        const formData = new FormData();
                                        formData.append('content', newMessage.trim() || '');

                                        let extension = 'webm';
                                        if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
                                            extension = 'm4a';
                                        } else if (mimeType.includes('mp3')) {
                                            extension = 'mp3';
                                        } else if (mimeType.includes('ogg')) {
                                            extension = 'ogg';
                                        } else if (mimeType.includes('wav')) {
                                            extension = 'wav';
                                        }

                                        formData.append('audio', blob, `voice_message.${extension}`);
                                        formData.append('audio_duration', duration || 1);

                                        if (replyingTo?.id) {
                                            formData.append('reply_to', replyingTo.id);
                                        }

                                        setIsSending(true);
                                        try {
                                            const response = await fetch(`/admin/projects/${projectId}/messages`, {
                                                method: 'POST',
                                                headers: {
                                                    Accept: 'application/json',
                                                    'X-Requested-With': 'XMLHttpRequest',
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                },
                                                credentials: 'same-origin',
                                                body: formData,
                                            });

                                            if (!response.ok) {
                                                const errorData = await response.json().catch(() => ({}));
                                                throw new Error(errorData.error || 'Failed to send message');
                                            }

                                            console.log('✅ Audio sent successfully via onSendAudioDirect (idle state)');
                                            setNewMessage('');
                                            setReplyingTo(null);
                                        } catch (error) {
                                            console.error('❌ Failed to send audio via onSendAudioDirect (idle state):', error);
                                            alert('Failed to send audio: ' + error.message);
                                        } finally {
                                            setIsSending(false);
                                        }
                                    }}
                                />
                                <Input
                                    placeholder={replyingTo ? `Reply to ${replyingTo.user.name}...` : 'Type something...'}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 rounded-lg border-border/50 transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    disabled={isSending}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className={cn(
                                        'h-9 w-9 rounded-lg transition-all duration-200',
                                        'bg-primary text-primary-foreground hover:bg-primary/90',
                                        'shadow-md hover:scale-110 hover:shadow-lg active:scale-95',
                                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                                    )}
                                    disabled={
                                        isSending ||
                                        (!newMessage.trim() &&
                                            !audioBlob &&
                                            !(voiceRecorderRef.current?.isRecording && voiceRecorderRef.current?.canSend))
                                    }
                                    title="Send message"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Chat;
