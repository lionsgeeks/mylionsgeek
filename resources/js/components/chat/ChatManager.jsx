import { useEffect, useState } from 'react';
import FloatingChatWindow from './FloatingChatWindow';

export default function ChatManager() {
    const [openChats, setOpenChats] = useState([]);
    const [expandedChat, setExpandedChat] = useState(null);

    useEffect(() => {
        const handleOpenChat = async (event) => {
            const { userId } = event.detail;

            // Check if chat already open
            if (openChats.find((chat) => chat.otherUserId === userId)) {
                // If minimized, maximize it
                setOpenChats((prev) => prev.map((chat) => (chat.otherUserId === userId ? { ...chat, isMinimized: false } : chat)));
                return;
            }

            try {
                const response = await fetch(`/chat/conversation/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOpenChats((prev) => [
                        ...prev,
                        {
                            id: data.conversation.id,
                            conversation: data.conversation,
                            otherUserId: userId,
                            isMinimized: false,
                        },
                    ]);
                }
            } catch (error) {
                console.error('Failed to open chat:', error);
            }
        };

        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [openChats]);

    const handleClose = (chatId) => {
        setOpenChats((prev) => prev.filter((chat) => chat.id !== chatId));
    };

    const handleMinimize = (chatId) => {
        setOpenChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, isMinimized: !chat.isMinimized, isExpanded: false } : chat)));
        if (expandedChat === chatId) {
            setExpandedChat(null);
        }
    };

    const handleExpand = (chatId) => {
        setOpenChats((prev) =>
            prev.map((chat) => (chat.id === chatId ? { ...chat, isExpanded: !chat.isExpanded, isMinimized: false } : { ...chat, isExpanded: false })),
        );
        setExpandedChat(expandedChat === chatId ? null : chatId);
    };

    if (openChats.length === 0) return null;

    // Separate expanded and normal chats
    const expandedChatData = openChats.find((chat) => chat.id === expandedChat);
    const normalChats = openChats.filter((chat) => chat.id !== expandedChat);

    return (
        <>
            {/* Expanded Chat */}
            {expandedChatData && (
                <div className="fixed inset-4 z-[60] rounded-lg border border-border bg-white shadow-2xl dark:bg-dark">
                    <FloatingChatWindow
                        conversation={expandedChatData.conversation}
                        isMinimized={false}
                        isExpanded={true}
                        onClose={() => {
                            handleClose(expandedChatData.id);
                            setExpandedChat(null);
                        }}
                        onMinimize={() => handleMinimize(expandedChatData.id)}
                        onExpand={() => handleExpand(expandedChatData.id)}
                    />
                </div>
            )}

            {/* Normal Floating Chats */}
            {normalChats.length > 0 && (
                <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2">
                    {normalChats.map((chat, index) => {
                        // Stack windows with slight offset
                        const offset = (normalChats.length - 1 - index) * 8;
                        return (
                            <div
                                key={chat.id}
                                style={{
                                    transform: `translateX(-${offset}px) translateY(-${offset}px)`,
                                    zIndex: 50 + index,
                                }}
                            >
                                <FloatingChatWindow
                                    conversation={chat.conversation}
                                    isMinimized={chat.isMinimized}
                                    isExpanded={false}
                                    onClose={() => handleClose(chat.id)}
                                    onMinimize={() => handleMinimize(chat.id)}
                                    onExpand={() => handleExpand(chat.id)}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
