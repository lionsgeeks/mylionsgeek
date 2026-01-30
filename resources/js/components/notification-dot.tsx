import { Bell } from 'lucide-react';
import React from 'react';

interface NotificationDotProps {
    isVisible: boolean;
    className?: string;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ isVisible, className = '' }) => {
    if (!isVisible) return null;

    return (
        <div className={`absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-[var(--color-alpha)] ${className}`}>
            <Bell className="h-2 w-2 text-white" />
        </div>
    );
};

export default NotificationDot;
