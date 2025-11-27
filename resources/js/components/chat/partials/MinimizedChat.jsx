import React from 'react';
import { X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Component dial minimized chat shortcut
export default function MinimizedChat({ conversation, unreadCount, onOpen, onClose }) {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
            <div className="relative group">
                <button
                    onClick={onOpen}
                    className={cn(
                        "relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-alpha shadow-lg hover:scale-110 transition-transform cursor-pointer",
                        unreadCount > 0 && "ring-blue-500"
                    )}
                    title={conversation.other_user.name}
                >
                    <Avatar
                        className="w-full h-full"
                        image={conversation.other_user.image}
                        name={conversation.other_user.name}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white border-2 border-background">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity p-0"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

