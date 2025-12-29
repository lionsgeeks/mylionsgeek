import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
// Removed ScrollArea import - using native scroll with hidden scrollbar
import { MessageSquare, Send, Smile, Reply, X, Edit2, Trash2, Check, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useAblyChannel from '@/hooks/useAblyChannel';
import { cn } from '@/lib/utils';

const Chat = ({ projectId, messages: initialMessages = [] }) => {
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
                    console.log('✅ Connected to project chat channel:', channelName);
                }
            },
            onError: (error) => {
                console.error('❌ Ably connection error:', error);
            },
        }
    );

    // Fetch initial messages
    useEffect(() => {
        if (projectId) {
            fetch(`/admin/projects/${projectId}/messages`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
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
            console.log('📨 Received new message via Ably:', data);
            // Check if message already exists to prevent duplicates
            setMessages((prev) => {
                const exists = prev.some(msg => msg.id === data.id);
                if (exists) {
                    console.log('⚠️ Duplicate message detected, skipping');
                    return prev;
                }
                console.log('✅ Adding new message to chat');
                // Ensure reactions is always an array
                return [...prev, {
                    ...data,
                    reactions: data.reactions || [],
                }];
            });
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        const handleReactionUpdate = (data) => {
            console.log('📨 Received reaction update via Ably (real-time for all users):', data);
            if (!data || !data.message_id) {
                console.warn('⚠️ Invalid reaction update data:', data);
                return;
            }
            
            setMessages((prev) => {
                const messageExists = prev.some(msg => msg.id === data.message_id);
                if (!messageExists) {
                    console.warn('⚠️ Reaction update received for non-existent message:', data.message_id, '- message may have been deleted');
                    return prev;
                }
                
                const updated = prev.map(msg => {
                    if (msg.id === data.message_id) {
                        console.log('✅ Updating reactions for message:', data.message_id, 'New reactions:', data.reactions);
                        return { 
                            ...msg, 
                            reactions: Array.isArray(data.reactions) ? data.reactions : [] 
                        };
                    }
                    return msg;
                });
                
                return updated;
            });
        };

        const handleMessageUpdate = (data) => {
            console.log('📨 Received message update via Ably:', data);
            setMessages((prev) => {
                const updated = prev.map(msg => 
                    msg.id === data.id 
                        ? { 
                            ...msg, 
                            content: data.content,
                            timestamp: data.timestamp,
                            updated_at: data.updated_at,
                            reactions: data.reactions || [],
                            reply_to: data.reply_to,
                        }
                        : msg
                );
                const found = prev.find(msg => msg.id === data.id);
                if (found) {
                    console.log('✅ Message updated in real-time');
                }
                return updated;
            });
            // Cancel edit mode if editing this message
            if (editingMessage?.id === data.id) {
                console.log('🔄 Cancelling edit mode after real-time update');
                setEditingMessage(null);
                setEditContent('');
                setIsEditing(false);
            }
        };

        const handleMessageDelete = (data) => {
            console.log('📨 Received message deletion via Ably (real-time for all users):', data);
            if (!data || !data.message_id) {
                console.warn('⚠️ Invalid deletion data:', data);
                return;
            }
            
            setMessages((prev) => {
                const messageExists = prev.some(msg => msg.id === data.message_id);
                if (!messageExists) {
                    console.log('ℹ️ Message already deleted or not found:', data.message_id, '- may have been optimistically deleted');
                    return prev; // Message already deleted (optimistic update)
                }
                const filtered = prev.filter(msg => msg.id !== data.message_id);
                console.log('✅ Message deleted in real-time - synced for all users');
                return filtered;
            });
            
            // Cancel edit mode if editing this message
            if (editingMessage?.id === data.message_id) {
                console.log('🔄 Cancelling edit mode after message deletion');
                setEditingMessage(null);
                setEditContent('');
                setIsEditing(false);
            }
        };

        // Register the callbacks for real-time updates
        console.log('📡 Registering Ably event handlers for real-time updates');
        subscribe('new-message', handleNewMessage);
        subscribe('message-reaction-updated', handleReactionUpdate);
        subscribe('message-updated', handleMessageUpdate);
        subscribe('message-deleted', handleMessageDelete);
        console.log('✅ All real-time event handlers registered');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !projectId || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setReplyingTo(null);
        setIsSending(true);

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ 
                    content,
                    reply_to: replyingTo?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Don't add message here - it will be received via Ably broadcast
            // This prevents duplicate messages
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setNewMessage(content);
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
            console.log('⚠️ Cannot save edit:', { 
                hasContent: !!editContent.trim(), 
                hasProjectId: !!projectId, 
                hasEditingMessage: !!editingMessage, 
                isEditing 
            });
            return;
        }

        const content = editContent.trim();
        const messageId = editingMessage.id;
        console.log('💾 Saving message edit:', { messageId, content });
        setIsEditing(true);

        // Optimistically update the UI
        setMessages((prev) => 
            prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, content: content, updated_at: new Date().toISOString() }
                    : msg
            )
        );

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
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
            console.log('✅ Message updated successfully:', result);

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
                        'Accept': 'application/json',
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

        console.log('🗑️ Deleting message:', messageId);

        // Optimistically remove the message from UI for immediate feedback
        setMessages((prev) => prev.filter(msg => msg.id !== messageId));
        
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
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete message');
            }

            console.log('✅ Message deleted successfully - real-time update will sync for all users');
            // Real-time update will sync the deletion across all clients via Ably
        } catch (error) {
            console.error('Failed to delete message:', error);
            // Revert optimistic update on error - refetch messages
            if (projectId) {
                fetch(`/admin/projects/${projectId}/messages`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
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

        console.log('👍 Toggling reaction:', { messageId, reaction, userId: auth?.user?.id });

        // Optimistically update the UI for immediate feedback
        setMessages((prev) => 
            prev.map(msg => {
                if (msg.id !== messageId) return msg;
                
                const currentReactions = msg.reactions || [];
                const reactionIndex = currentReactions.findIndex(r => r.reaction === reaction);
                const userReacted = reactionIndex >= 0 && 
                    currentReactions[reactionIndex].users?.includes(auth?.user?.name);
                
                let updatedReactions;
                if (userReacted) {
                    // Remove reaction
                    updatedReactions = currentReactions.map(r => {
                        if (r.reaction === reaction) {
                            const newUsers = r.users.filter(u => u !== auth?.user?.name);
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
                    }).filter(Boolean);
                } else {
                    // Add reaction - remove user's other reactions first
                    updatedReactions = currentReactions
                        .map(r => ({
                            ...r,
                            users: r.users.filter(u => u !== auth?.user?.name),
                            count: r.users.filter(u => u !== auth?.user?.name).length,
                        }))
                        .filter(r => r.count > 0);
                    
                    // Add or update the new reaction
                    const existingReactionIndex = updatedReactions.findIndex(r => r.reaction === reaction);
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
            })
        );

        try {
            const response = await fetch(`/admin/projects/${projectId}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
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
            
            console.log('✅ Reaction toggle successful - real-time update will sync for all users');
            // The real update will come via Ably and sync for all users
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
            // Revert optimistic update on error - refetch messages
            if (projectId) {
                fetch(`/admin/projects/${projectId}/messages`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
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
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="lg:h-screen lg:w-1/3 xl:w-1/4 p-4">
                    <SheetHeader>
                        <SheetTitle>Team Chat</SheetTitle>
                        <SheetDescription>Chat with your team members</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 mt-4 mb-4 lg:h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide" ref={scrollAreaRef}>
                        <div className="space-y-4 pr-2">
                            {messages.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isCurrentUser = message.user.id === currentUserId;
                                    return (
                                        <div 
                                            key={message.id} 
                                            className={cn(
                                                "flex gap-3 group",
                                                isCurrentUser ? "flex-row-reverse" : "flex-row"
                                            )}
                                        >
                                            {!isCurrentUser && (
                                                <Avatar
                                                    className="h-8 w-8 flex-shrink-0"
                                                    image={message.user.avatar}
                                                    name={message.user.name}
                                                    onlineCircleClass="hidden"
                                                />
                                            )}
                                            <div className={cn(
                                                "flex flex-col max-w-[75%]",
                                                isCurrentUser ? "items-end" : "items-start"
                                            )}>
                                                {!isCurrentUser && (
                                                    <span className="text-xs font-medium text-muted-foreground mb-1">
                                                        {message.user.name}
                                                    </span>
                                                )}
                                                {message.reply_to && (
                                                    <div className={cn(
                                                        "text-xs p-2 mb-1 rounded border-l-2",
                                                        isCurrentUser 
                                                            ? "bg-primary/10 border-primary text-primary-foreground/70" 
                                                            : "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                                                    )}>
                                                        <div className="font-medium">{message.reply_to.user.name}</div>
                                                        <div className="truncate">{message.reply_to.content}</div>
                                                    </div>
                                                )}
                                                {editingMessage?.id === message.id ? (
                                                    <div className={cn(
                                                        "rounded-lg px-3 py-2 text-sm relative",
                                                        isCurrentUser 
                                                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                                                            : "bg-muted rounded-bl-sm"
                                                    )}>
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
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={handleSaveEdit}
                                                                disabled={isEditing || !editContent.trim()}
                                                            >
                                                                <Check className="h-3 w-3 mr-1" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={handleCancelEdit}
                                                                disabled={isEditing}
                                                            >
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={cn(
                                                        "rounded-lg px-3 py-2 text-sm relative",
                                                        isCurrentUser 
                                                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                                                            : "bg-muted rounded-bl-sm"
                                                    )}>
                                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                        {message.updated_at && message.updated_at !== message.timestamp && (
                                                            <span className={cn(
                                                                "text-xs block mt-1",
                                                                isCurrentUser ? "text-primary-foreground/50" : "text-muted-foreground/70"
                                                            )}>
                                                                (edited)
                                                            </span>
                                                        )}
                                                    <div className={cn(
                                                        "flex items-center gap-1 mt-1",
                                                        isCurrentUser ? "justify-end" : "justify-start"
                                                    )}>
                                                        <span className={cn(
                                                            "text-xs",
                                                            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                                        )}>
                                                            {new Date(message.timestamp).toLocaleTimeString(undefined, {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                )}
                                                {message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0 && (
                                                    <div className={cn(
                                                        "flex flex-wrap gap-1 mt-1",
                                                        isCurrentUser ? "justify-end" : "justify-start"
                                                    )}>
                                                        {message.reactions.map((reactionGroup, idx) => {
                                                            const userReacted = reactionGroup.users && 
                                                                Array.isArray(reactionGroup.users) && 
                                                                reactionGroup.users.includes(auth?.user?.name);
                                                            return (
                                                                <button
                                                                    key={`${reactionGroup.reaction}-${idx}`}
                                                                    onClick={() => handleToggleReaction(message.id, reactionGroup.reaction)}
                                                                    className={cn(
                                                                        "text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 hover:bg-muted transition-colors cursor-pointer",
                                                                        userReacted
                                                                            ? "bg-primary/10 border-primary text-primary" 
                                                                            : "bg-background border-border"
                                                                    )}
                                                                    title={reactionGroup.users?.join(', ') || ''}
                                                                >
                                                                    <span>{reactionGroup.reaction}</span>
                                                                    <span>{reactionGroup.count || 0}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    <Popover open={showReactionPicker === message.id} onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Smile className="h-3 w-3" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-2" align={isCurrentUser ? "end" : "start"}>
                                                            <div className="flex gap-2">
                                                                {reactions.map((reaction) => {
                                                                    const hasReaction = message.reactions?.some(
                                                                        r => r.reaction === reaction && 
                                                                        r.users?.includes(auth?.user?.name)
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
                                                                                "text-xl hover:scale-125 transition-transform p-1 rounded",
                                                                                hasReaction && "bg-primary/10"
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
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => setReplyingTo(message)}
                                                    >
                                                        <Reply className="h-3 w-3" />
                                                    </Button>
                                                    {isCurrentUser && editingMessage?.id !== message.id && (
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
                    <SheetFooter className="flex-col gap-2">
                        {replyingTo && (
                            <div className="w-full p-2 bg-muted rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground">Replying to {replyingTo.user.name}</div>
                                    <div className="text-sm truncate">{replyingTo.content}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                            <Input
                                placeholder={replyingTo ? `Reply to ${replyingTo.user.name}...` : "Type something..."}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={isSending || !newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Chat;
