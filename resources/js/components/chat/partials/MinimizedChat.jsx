import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// Component dial minimized chat shortcut
export default function MinimizedChat({ conversation, unreadCount, onOpen, onClose }) {
    return (
        <div className="fixed right-4 bottom-4 z-[100] flex flex-col items-end gap-2">
            <div className="group relative">
                <button
                    onClick={onOpen}
                    className={cn(
                        'relative h-14 w-14 cursor-pointer overflow-hidden rounded-full shadow-lg ring-2 ring-alpha transition-transform hover:scale-110',
                        unreadCount > 0 && 'ring-blue-500',
                    )}
                    title={conversation.other_user.name}
                >
                    <Avatar className="h-full w-full" image={conversation.other_user.image} name={conversation.other_user.name} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-blue-500 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-error p-0 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
