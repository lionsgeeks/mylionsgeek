import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Search, Loader2, X, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { router, usePage } from '@inertiajs/react';
import ChatBox from './ChatBox';
import { Button } from '@/components/ui/button';
import ConversationDeletePopover from './partials/ConversationDeletePopover';

// Component dial list dial conversations - ybdl conversations w y7al chatbox
const ConversationsList = forwardRef(function ConversationsList({ onCloseChat, onUnreadCountChange }, ref) {
    const { conversations: sharedConversations, conversation: sharedConversation } = usePage().props;
    const [conversations, setConversations] = useState(sharedConversations || []);
    const [selectedConversation, setSelectedConversation] = useState(sharedConversation || null);
    const [loading, setLoading] = useState(!sharedConversations);
    const [searchQuery, setSearchQuery] = useState('');

    // Expose method dial open conversation dyal user specific
    useImperativeHandle(ref, () => ({
        openConversationWithUser: (userId) => {
            router.visit(`/chat/conversation/${userId}`, {
                preserveState: true,
                preserveScroll: true,
                only: ['conversation'],
                onSuccess: (page) => {
                    setSelectedConversation(page.props.conversation);
                },
            });
        }
    }));

    useEffect(() => {
        // If we don't have conversations in props, fetch them
        if (!conversations.length) {
            fetchConversations();
        }
    }, []);

    useEffect(() => {
        if (sharedConversations) {
            setConversations(sharedConversations);
        }
    }, [sharedConversations]);

    const fetchConversations = () => {
        setLoading(true);
        router.visit('/chat', {
            preserveState: true,
            preserveScroll: true,
            only: ['conversations'],
            onSuccess: (page) => {
                const fetchedConversations = page.props.conversations || [];
                setConversations(fetchedConversations);
                
                const totalUnread = fetchedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
                if (onUnreadCountChange) {
                    onUnreadCountChange(totalUnread);
                }
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleConversationClick = (conversationId, otherUserId) => {
        router.visit(`/chat/conversation/${otherUserId}`, {
            preserveState: true,
            preserveScroll: true,
            only: ['conversation'],
            onSuccess: (page) => {
                setSelectedConversation(page.props.conversation);
            },
        });
    };

    const filteredConversations = conversations.filter(conv => 
        conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.other_user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full w-full overflow-hidden bg-background rounded-xl">
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
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 text-sm bg-muted/50 border-muted focus:bg-background"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <ScrollArea className="flex-1 min-h-0">
                    {loading ? (
                        <div className="p-2 space-y-1">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-4 w-24 rounded" />
                                            <Skeleton className="h-3 w-12 rounded" />
                                        </div>
                                        <Skeleton className="h-3 w-full max-w-[80%] rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
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
                    {/* Desktop: Show chat alongside conversations */}
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
                    {/* Mobile: Full Screen Chat Overlay */}
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
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left border border-transparent",
                    isSelected 
                        ? "bg-primary/10 border-primary/20 shadow-sm" 
                        : "hover:bg-accent/50 hover:border-accent"
                )}
            >
                <Avatar
                    className="h-12 w-12 flex-shrink-0"
                    image={conversation.other_user.image}
                    name={conversation.other_user.name}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                        <p className={cn(
                            "text-sm font-semibold truncate",
                            conversation.unread_count > 0 && "font-bold"
                        )}>
                            {conversation.other_user.name}
                        </p>
                        {conversation.last_message_at && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
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
                            "text-xs truncate",
                            conversation.unread_count > 0 
                                ? "font-medium text-foreground" 
                                : "text-muted-foreground"
                        )}>
                            {conversation.last_message.body || '📎 Attachment'}
                        </p>
                    )}
                </div>
                {conversation.unread_count > 0 && (
                    <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-alpha text-xs font-bold text-black">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </span>
                )}
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ConversationDeletePopover 
                    conversationId={conversation.id}
                    onDeleted={onDeleted}
                />
            </div>
        </div>
    );
}
