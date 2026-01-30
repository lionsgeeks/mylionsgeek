// Toast notification component for chat messages
// Component dial toast notification bach new messages

import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastNotification({ notification, onClose, onClick }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!notification || !isVisible) return null;

    const getMessagePreview = () => {
        if (notification.attachment_type === 'image') return '📷 Image';
        if (notification.attachment_type === 'video') return '🎥 Video';
        if (notification.attachment_type === 'audio') return '🎤 Voice message';
        if (notification.attachment_type === 'file') return '📎 File';
        return notification.body || 'New message';
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'w-full max-w-sm',
                'rounded-xl border border-border bg-background shadow-lg',
                'transform cursor-pointer transition-all duration-300 ease-in-out',
                'backdrop-blur-sm hover:scale-[1.02] hover:shadow-xl',
                'border-alpha/20 bg-background/95',
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
            )}
        >
            <div className="flex items-start gap-3 p-4">
                <Avatar className="h-10 w-10 flex-shrink-0" image={notification.sender?.image} name={notification.sender?.name || 'User'} />
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-foreground">{notification.sender?.name || 'New message'}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(false);
                                setTimeout(() => onClose(), 300);
                            }}
                            className="ml-2 flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{getMessagePreview()}</p>
                </div>
            </div>
        </div>
    );
}
