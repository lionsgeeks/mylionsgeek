import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationSystemProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
    notifications,
    onMarkAsRead,
    onClearAll
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-blue-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-l-green-500 bg-green-50';
            case 'warning':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'error':
                return 'border-l-red-500 bg-red-50';
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 top-10 w-80 z-50 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Notifications
                        </CardTitle>
                        <div className="flex space-x-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClearAll}
                                    className="text-xs"
                                >
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                                            !notification.read ? 'font-medium' : 'opacity-75'
                                        }`}
                                        onClick={() => onMarkAsRead(notification.id)}
                                    >
                                        <div className="flex items-start space-x-2">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {notification.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-[var(--color-alpha)] rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default NotificationSystem;
