import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationDotProps {
    isVisible: boolean;
    className?: string;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ isVisible, className = "" }) => {
    if (!isVisible) return null;

    return (
        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-alpha)] rounded-full animate-pulse ${className}`}>
            <Bell className="w-2 h-2 text-white" />
        </div>
    );
};

export default NotificationDot;
