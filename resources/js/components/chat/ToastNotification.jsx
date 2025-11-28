// Toast notification component for chat messages
// Component dial toast notification bach new messages

import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
                "max-w-sm w-full",
                "bg-background border border-border rounded-xl shadow-lg",
                "transform transition-all duration-300 ease-in-out cursor-pointer",
                "hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm",
                "border-alpha/20 bg-background/95",
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
        >
            <div className="flex items-start gap-3 p-4">
                <Avatar
                    className="h-10 w-10 flex-shrink-0"
                    image={notification.sender?.image}
                    name={notification.sender?.name || 'User'}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {notification.sender?.name || 'New message'}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(false);
                                setTimeout(() => onClose(), 300);
                            }}
                            className="flex-shrink-0 ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {getMessagePreview()}
                    </p>
                </div>
            </div>
        </div>
    );
}

