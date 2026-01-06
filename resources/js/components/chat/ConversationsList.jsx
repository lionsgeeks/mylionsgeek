import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Search, X, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { subscribeToChannel, unsubscribeFromChannel } from '@/lib/ablyManager';
import { subscribeToConversationForNotifications } from '@/lib/globalChatListener';
import ChatBox from './ChatBox';
import { Button } from '@/components/ui/button';
import ConversationDeletePopover from './partials/ConversationDeletePopover';

// Component dial list dial conversations - ybdl conversations w y7al chatbox
const ConversationsList = forwardRef(function ConversationsList({ onCloseChat, onUnreadCountChange }, ref) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const searchTimeoutRef = useRef(null);
    const ablySubscriptionsRef = useRef(new Map());

    // Get CSRF token
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    };

    // Expose method dial open conversation dyal user specific
    useImperativeHandle(ref, () => ({
        openConversationWithUser: async (userId) => {
            try {
                const response = await fetch(`/chat/conversation/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch conversation');
                
                const data = await response.json();
                setSelectedConversation(data.conversation);
            } catch (error) {
                console.error('Failed to open conversation:', error);
            }
        }
    }));

    useEffect(() => {
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real-time updates for all conversations - Tssma3 3la kol conversations bach n3rfo b3d updates
    useEffect(() => {
        if (conversations.length === 0) return;

        const unsubscribeFunctions = [];

        // Subscribe to all conversation channels for real-time updates
        conversations.forEach((conversation) => {
            const channelName = `chat:conversation:${conversation.id}`;
            
            // Handle new messages
            const handleNewMessage = (messageData) => {
                const isFromOtherUser = messageData.sender_id !== currentUser.id;
                
                // Toast notifications are handled globally - no need to show here
                // Global listener will handle showing toasts unconditionally
                
                setConversations(prev => {
                    const updated = prev.map(conv => {
                        if (conv.id === conversation.id) {
                            // Increment unread if message is from other user and not selected
                            const isSelected = selectedConversation?.id === conv.id;
                            
                            const unreadCount = isSelected 
                                ? conv.unread_count 
                                : (isFromOtherUser ? (conv.unread_count || 0) + 1 : conv.unread_count);
                            
                            return {
                                ...conv,
                                last_message: {
                                    id: messageData.id,
                                    body: messageData.body || '📎 Attachment',
                                    sender_id: messageData.sender_id,
                                    attachment_type: messageData.attachment_type,
                                    created_at: messageData.created_at,
                                },
                                last_message_at: messageData.created_at,
                                unread_count: unreadCount,
                            };
                        }
                        return conv;
                    });

                    // Update total unread count
                    const totalUnread = updated.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
                    if (onUnreadCountChange) {
                        onUnreadCountChange(totalUnread);
                    }

                    return updated;
                });
            };

            // Handle message deletions
            const handleMessageDeleted = (data) => {
                const { message_id } = data;
                
                setConversations(prev => prev.map(conv => {
                    if (conv.id === conversation.id && conv.last_message?.id === message_id) {
                        // If deleted message was the last one, refresh conversation
                        fetchConversations();
                    }
                    return conv;
                }));
            };

            // Subscribe to events for conversation updates
            subscribeToChannel(channelName, 'new-message', handleNewMessage).then(unsub => {
                if (unsub) unsubscribeFunctions.push(unsub);
            });
            
            subscribeToChannel(channelName, 'message-deleted', handleMessageDeleted).then(unsub => {
                if (unsub) unsubscribeFunctions.push(() => unsubscribeFromChannel(channelName, 'message-deleted', handleMessageDeleted));
            });
            
            // Subscribe to global notifications (toasts) - this handles unconditional toast showing
            subscribeToConversationForNotifications(conversation.id, conversation);
        });

        // Cleanup function
        return () => {
            unsubscribeFunctions.forEach(unsub => {
                try {
                    if (typeof unsub === 'function') unsub();
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            });
        };
    }, [conversations.map(c => c.id).join(','), selectedConversation?.id, onUnreadCountChange, currentUser.id]);

    // Fetch conversations b fetch
    const fetchConversations = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/chat', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to fetch conversations:', errorData);
                throw new Error(errorData.message || 'Failed to fetch conversations');
            }

            const data = await response.json();
            const fetchedConversations = data.conversations || [];
            setConversations(fetchedConversations);

            const totalUnread = fetchedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
            if (onUnreadCountChange) {
                onUnreadCountChange(totalUnread);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            // Set empty array on error to prevent UI issues
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [onUnreadCountChange]);

    // Handle conversation click b fetch
    const handleConversationClick = async (conversationId, otherUserId) => {
        try {
            const response = await fetch(`/chat/conversation/${otherUserId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch conversation');

            const data = await response.json();
            setSelectedConversation(data.conversation);
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        }
    };

    // Search for users when typing
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If search query is empty, clear results
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearchingUsers(false);
            return;
        }

        // Debounce search
        setIsSearchingUsers(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=students`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    setSearchResults([]);
                    return;
                }

                const data = await response.json();
                const users = data.results || [];
                
                // Get following IDs to filter users
                const followingResponse = await fetch('/chat/following-ids', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                
                let followingIds = [];
                if (followingResponse.ok) {
                    const followingData = await followingResponse.json();
                    followingIds = followingData.following_ids || [];
                }
                
                // Filter users: exclude current user and only show users we follow
                const filteredUsers = users.filter(user => 
                    user.id !== currentUser.id && 
                    followingIds.includes(user.id)
                );
                
                setSearchResults(filteredUsers);
            } catch (error) {
                console.error('Failed to search users:', error);
                setSearchResults([]);
            } finally {
                setIsSearchingUsers(false);
            }
        }, 300);
    }, [searchQuery, currentUser.id]);

    const filteredConversations = conversations.filter(conv => 
        conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.other_user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle user selection from search
    const handleUserSelect = async (userId) => {
        try {
            setSearchQuery(''); // Clear search
            setSearchResults([]);
            
            const response = await fetch(`/chat/conversation/${userId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.error || 'Failed to start conversation');
                return;
            }

            const data = await response.json();
            setSelectedConversation(data.conversation);
            
            // Refresh conversations list
            fetchConversations();
        } catch (error) {
            console.error('Failed to start conversation:', error);
            alert('Failed to start conversation. Please try again.');
        }
    };

    // Skeleton loader
    const ConversationListSkeleton = () => (
        <div className="p-2 space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-2/3 rounded" />
                            <Skeleton className="h-3 w-12 rounded" />
                        </div>
                        <Skeleton className="h-3 w-full max-w-[80%] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex h-full w-full overflow-hidden bg-background">
            {/* Left Sidebar - Conversations */}
            <div className={cn(
                "flex flex-col border-r bg-background transition-all duration-300 flex-shrink-0",
                selectedConversation 
                    ? "hidden md:flex w-full md:w-[40%] lg:w-[35%]" 
                    : "w-full md:w-[40%] lg:w-[35%]"
            )}>
                {/* Header */}
                <div className="px-5 py-4 border-b shrink-0 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
                    <h3 className="font-bold text-xl tracking-tight">Messages</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCloseChat}
                        className="h-9 w-9 hover:bg-accent"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b shrink-0 bg-background">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations or users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 text-sm bg-muted/50 border-muted focus:bg-background"
                        />
                    </div>
                    
                    {/* User Search Results */}
                    {searchQuery.trim() && searchResults.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                            <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                                Start conversation with:
                            </div>
                            {searchResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleUserSelect(user.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                >
                                    <Avatar
                                        className="h-10 w-10 flex-shrink-0"
                                        image={user.image || user.avatar}
                                        name={user.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {searchQuery.trim() && isSearchingUsers && (
                        <div className="mt-2 px-2 py-3 text-sm text-muted-foreground text-center">
                            Searching...
                        </div>
                    )}
                    
                    {searchQuery.trim() && !isSearchingUsers && searchResults.length === 0 && filteredConversations.length === 0 && (
                        <div className="mt-2 px-2 py-3 text-sm text-muted-foreground text-center">
                            No users found. Make sure you're following them first.
                        </div>
                    )}
                </div>

                {/* Conversations List */}
                <ScrollArea className="flex-1 min-h-0">
                    {loading ? (
                        <ConversationListSkeleton />
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-sm font-medium">{searchQuery ? 'No conversations found' : 'No messages yet'}</p>
                            <p className="text-xs mt-1 opacity-70">{searchQuery ? 'Try a different search' : 'Start a conversation'}</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredConversations.map((conversation) => (
                                <ConversationItem
                                    key={conversation.id}
                                    conversation={conversation}
                                    isSelected={selectedConversation?.id === conversation.id}
                                    onClick={() => handleConversationClick(conversation.id, conversation.other_user.id)}
                                    onDeleted={() => {
                                        setConversations(prev => prev.filter(c => c.id !== conversation.id));
                                        if (selectedConversation?.id === conversation.id) {
                                            setSelectedConversation(null);
                                        }
                                        fetchConversations();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Right Side - Chat Box */}
            {selectedConversation ? (
                <>
                    <div className="flex-1 hidden md:flex flex-col min-w-0">
                        <ChatBox
                            conversation={selectedConversation}
                            onBack={() => {
                                setSelectedConversation(null);
                                fetchConversations();
                            }}
                            onClose={onCloseChat}
                            isExpanded={false}
                        />
                    </div>
                    <div className="md:hidden fixed inset-0 z-[100] bg-background flex flex-col">
                        <ChatBox
                            conversation={selectedConversation}
                            onBack={() => {
                                setSelectedConversation(null);
                                fetchConversations();
                            }}
                            onClose={onCloseChat}
                            isExpanded={false}
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                    <div className="text-center space-y-4 px-8">
                        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-12 w-12 text-primary/40" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                            <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ConversationsList;

function ConversationItem({ conversation, isSelected, onClick, onDeleted }) {
    // Format last message preview
    const getLastMessagePreview = () => {
        if (!conversation.last_message) return 'No messages yet';
        
        const { body, attachment_type } = conversation.last_message;
        
        if (attachment_type === 'image') return '📷 Image';
        if (attachment_type === 'video') return '🎥 Video';
        if (attachment_type === 'audio') return '🎤 Voice message';
        if (attachment_type === 'file') return '📎 File';
        if (body) return body;
        
        return '📎 Attachment';
    };

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-left border",
                    isSelected 
                        ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border-primary/30 shadow-md shadow-primary/10" 
                        : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-muted hover:shadow-sm",
                    conversation.unread_count > 0 && !isSelected && "bg-primary/5 border-primary/20"
                )}
            >
                <div className="relative flex-shrink-0">
                    <Avatar
                        className={cn(
                            "h-14 w-14 flex-shrink-0 ring-2 transition-all",
                            isSelected 
                                ? "ring-primary/40 ring-offset-2" 
                                : conversation.unread_count > 0
                                    ? "ring-primary/30"
                                    : "ring-transparent"
                        )}
                        image={conversation.other_user.image}
                        name={conversation.other_user.name}
                    />
                    {conversation.unread_count > 0 && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-alpha text-[10px] font-bold text-black ring-2 ring-background shadow-sm">
                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <p className={cn(
                            "text-sm font-semibold truncate",
                            conversation.unread_count > 0 
                                ? "font-bold text-foreground" 
                                : "text-foreground/90"
                        )}>
                            {conversation.other_user.name}
                        </p>
                        {conversation.last_message_at && (
                            <span className={cn(
                                "text-xs whitespace-nowrap flex-shrink-0 font-medium",
                                conversation.unread_count > 0 
                                    ? "text-primary" 
                                    : "text-muted-foreground"
                            )}>
                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                                    .replace('about ', '')
                                    .replace(' ago', '')
                                    .replace(' minutes', 'm')
                                    .replace(' hours', 'h')
                                    .replace(' days', 'd')
                                    .replace(' weeks', 'w')
                                    .replace(' months', 'mo')}
                            </span>
                        )}
                    </div>
                    {conversation.last_message && (
                        <p className={cn(
                            "text-xs truncate leading-relaxed",
                            conversation.unread_count > 0 
                                ? "font-medium text-foreground/90" 
                                : "text-muted-foreground"
                        )}>
                            {getLastMessagePreview()}
                        </p>
                    )}
                    {!conversation.last_message && (
                        <p className="text-xs text-muted-foreground italic">Start a conversation</p>
                    )}
                </div>
            </button>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ConversationDeletePopover 
                    conversationId={conversation.id}
                    onDeleted={onDeleted}
                />
            </div>
        </div>
    );
}
