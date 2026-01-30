import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import * as Ably from 'ably';
import { Bell, Briefcase, Calendar, CheckCircle, Clock, MessageSquare, User, Users, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

export default function NotificationIcon() {
    const page = usePage();
    const { auth, attendanceWarning } = page.props;
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [ablyClient, setAblyClient] = useState(null);
    const [denyModalOpen, setDenyModalOpen] = useState(false);
    const [denyNotificationId, setDenyNotificationId] = useState(null);
    const [denialReason, setDenialReason] = useState('');

    const userRoles = useMemo(() => {
        const role = auth?.user?.role;
        if (Array.isArray(role)) return role;
        return role ? [role] : [];
    }, [auth?.user?.role]);

    const isCoach = userRoles.includes('coach');
    const isAdmin = userRoles.includes('admin');
    const isStudioResponsable = userRoles.includes('studio_responsable');

    // Fetch notifications function
    const fetchNotifications = React.useCallback(async () => {
        const notificationList = [];

        try {
            // Fetch all notifications from API
            const response = await fetch('/api/notifications', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                const apiNotifications = data.notifications || [];

                // //console.log('Fetched notifications:', apiNotifications.length, apiNotifications);

                apiNotifications.forEach((notif) => {
                    try {
                        notificationList.push({
                            id: notif.id,
                            type: notif.type,
                            senderName: notif.sender_name || 'Unknown',
                            senderImage: notif.sender_image || null,
                            message: notif.message || 'No message',
                            link: notif.link || '#',
                            iconType: notif.icon_type || 'user',
                            timestamp: notif.created_at ? new Date(notif.created_at) : new Date(),
                            readAt: notif.read_at ? new Date(notif.read_at) : null,
                            accessType: notif.access_type || null,
                            notificationId: notif.notification_id || null,
                        });
                    } catch (e) {
                        console.error('Error processing notification:', e, notif);
                    }
                });
            } else {
                console.error('Failed to fetch notifications:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }

        // Add attendance alerts for coaches - only show active trainings
        if (isCoach && attendanceWarning?.hasWarning) {
            const allTrainings = Array.isArray(attendanceWarning.trainings) ? attendanceWarning.trainings : [];

            // Filter to only show active trainings (same logic as attendance-warning.jsx)
            const getTrainingStatus = (training) => {
                if (!training.start_time) return null;
                const start = new Date(training.start_time);
                const now = new Date();
                const sixMonthsLater = new Date(start);
                sixMonthsLater.setMonth(start.getMonth() + 6);
                if (now < sixMonthsLater && start < now) return 'active';
                return null;
            };

            const activeTrainings = allTrainings.filter((t) => getTrainingStatus(t) === 'active');

            activeTrainings.forEach((training) => {
                notificationList.push({
                    id: `attendance-${training.id}`,
                    type: 'attendance',
                    senderName: 'System',
                    senderImage: null,
                    message: `Don't forget to mark attendance for "${training.name}"`,
                    link: `/trainings/${training.id}`,
                    iconType: 'clock',
                    timestamp: new Date(),
                    readAt: null, // Attendance notifications are always unread (system notifications)
                });
            });
        }

        // Sort by timestamp (newest first)
        notificationList.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notificationList);
    }, [isCoach, isAdmin, isStudioResponsable, attendanceWarning]);

    // Fetch notifications on mount and when dependencies change
    useEffect(() => {
        fetchNotifications();

        // Initialize Ably for real-time notifications
        const initAbly = async () => {
            try {
                const response = await fetch('/api/notifications/ably-token');
                if (!response.ok) return;

                const { token, channelName } = await response.json();
                const ably = new Ably.Realtime(token);

                setAblyClient(ably);

                const channel = ably.channels.get(channelName);
                channel.subscribe('new_notification', (message) => {
                    const newNotification = {
                        id: message.data.id,
                        type: message.data.type,
                        senderName: message.data.sender_name,
                        senderImage: message.data.sender_image,
                        message: message.data.message,
                        link: message.data.link,
                        iconType: message.data.icon_type,
                        timestamp: new Date(message.data.created_at),
                        readAt: message.data.read_at ? new Date(message.data.read_at) : null,
                    };

                    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));

                    // Dispatch custom event for other components to listen
                    window.dispatchEvent(
                        new CustomEvent('ably-notification', {
                            detail: newNotification,
                        }),
                    );
                });
            } catch (error) {
                console.error('Failed to initialize Ably:', error);
            }
        };

        initAbly();

        // Refresh notifications every 30 seconds (fallback)
        const interval = setInterval(fetchNotifications, 30000);
        return () => {
            clearInterval(interval);
            if (ablyClient) {
                ablyClient.close();
            }
        };
    }, [fetchNotifications]);

    // Mark all notifications as read (except access_request notifications)
    const markAllAsRead = React.useCallback(async () => {
        try {
            // Use the mark-all-read endpoint which excludes access_request notifications on the backend
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            // Refresh notifications to get updated list with read_at timestamps
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, [fetchNotifications]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications().then(() => {
                // Mark all notifications as read after fetching them (except access_request)
                markAllAsRead();
            });
        }
    }, [isOpen, fetchNotifications, markAllAsRead]);

    // Handle dropdown open/close
    const handleDropdownClose = (open) => {
        setIsOpen(open);
    };

    // Calculate unread count (notifications without readAt)
    const unreadCount = notifications.filter((n) => !n.readAt).length;

    const markAsRead = async (notification) => {
        try {
            // Extract type and ID from notification.id (e.g., "follow-123" -> type="follow", id="123")
            // Handle compound types like "project-submission-123", "project-status-123", or "access-request-123"
            const parts = notification.id.split('-');
            let type, id;

            if (parts.length === 3 && parts[0] === 'project') {
                // Handle "project-submission-123" or "project-status-123"
                type = `${parts[0]}-${parts[1]}`;
                id = parts[2];
            } else if (parts.length === 3 && parts[0] === 'access' && parts[1] === 'request') {
                // Handle "access-request-123"
                type = `${parts[0]}-${parts[1]}`;
                id = parts[2];
            } else if (parts.length === 4 && parts[0] === 'access' && parts[1] === 'request' && parts[2] === 'response') {
                // Handle "access-request-response-123"
                type = `${parts[0]}-${parts[1]}-${parts[2]}`;
                id = parts[3];
            } else if (parts.length === 3 && parts[0] === 'task' && parts[1] === 'assignment') {
                // Handle "task-assignment-123"
                type = `${parts[0]}-${parts[1]}`;
                id = parts[2];
            } else if (parts.length === 3 && parts[0] === 'project' && parts[1] === 'message') {
                // Handle "project-message-123"
                type = `${parts[0]}-${parts[1]}`;
                id = parts[2];
            } else {
                // Handle simple types like "follow-123"
                type = parts[0];
                id = parts.slice(1).join('-');
            }

            await fetch(`/api/notifications/${type}/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });

            // Update notification to mark as read (don't remove it)
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date() } : n)));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const formatTimestamp = (date) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        } catch (e) {
            return '';
        }
    };

    const getIcon = (iconType) => {
        switch (iconType) {
            case 'briefcase':
                return Briefcase;
            case 'calendar':
                return Calendar;
            case 'clock':
                return Clock;
            case 'lock':
                return Lock;
            case 'check-circle':
                return CheckCircle;
            case 'x-circle':
                return XCircle;
            case 'message-square':
                return Users;
            case 'user':
            default:
                return User;
        }
    };

    const getIconColor = (iconType) => {
        switch (iconType) {
            case 'briefcase':
                return 'text-[var(--color-good)]';
            case 'calendar':
                return 'text-blue-600';
            case 'clock':
                return 'text-[var(--color-alpha)]';
            case 'lock':
                return 'text-yellow-600';
            case 'check-circle':
                return 'text-green-600';
            case 'x-circle':
                return 'text-red-600';
            case 'message-square':
                return 'text-blue-500';
            case 'user':
            default:
                return 'text-[var(--color-alpha)]';
        }
    };

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={handleDropdownClose}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-md" aria-label="Notifications">
                        <Bell className="h-5 w-5 flex-shrink-0" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[var(--color-error)] text-[10px] font-bold text-white dark:border-[var(--color-dark)]">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex max-h-[600px] w-96 flex-col p-0" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex flex-shrink-0 items-center justify-between border-b bg-[var(--color-card)] p-4">
                        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Notifications</h3>
                    </div>
                    <ScrollArea className="max-h-[500px] flex-1">
                        <div className="max-h-[500px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Bell className="mb-2 h-12 w-12 text-[var(--color-muted-foreground)]/50" />
                                    <p className="text-sm text-[var(--color-muted-foreground)]">No notifications</p>
                                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--color-border)]">
                                    {notifications.map((notification) => {
                                        const IconComponent = getIcon(notification.iconType);
                                        const iconColor = getIconColor(notification.iconType);
                                        const isAccessRequest = notification.type === 'access_request' && isAdmin;

                                        const handleApproveAccess = async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!notification.notificationId) return;

                                            try {
                                                const response = await fetch(`/admin/access-requests/${notification.notificationId}/approve`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN':
                                                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                });

                                                if (response.ok) {
                                                    markAsRead(notification);
                                                    fetchNotifications();
                                                }
                                            } catch (error) {
                                                console.error('Failed to approve access:', error);
                                            }
                                        };

                                        const handleDenyAccess = async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!notification.notificationId) return;

                                            // Open modal to get denial reason
                                            setDenyNotificationId(notification.notificationId);
                                            setDenyModalOpen(true);
                                        };

                                        const handleConfirmDeny = async () => {
                                            if (!denyNotificationId || !denialReason.trim()) {
                                                alert('Please provide a reason for denial');
                                                return;
                                            }

                                            try {
                                                const response = await fetch(`/admin/access-requests/${denyNotificationId}/deny`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN':
                                                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                    body: JSON.stringify({
                                                        denial_reason: denialReason,
                                                    }),
                                                });

                                                if (response.ok) {
                                                    const notificationToMark = notifications.find((n) => n.notificationId === denyNotificationId);
                                                    if (notificationToMark) {
                                                        markAsRead(notificationToMark);
                                                    }
                                                    setDenyModalOpen(false);
                                                    setDenyNotificationId(null);
                                                    setDenialReason('');
                                                    fetchNotifications();
                                                } else {
                                                    const data = await response.json();
                                                    alert(data.error || 'Failed to deny access request');
                                                }
                                            } catch (error) {
                                                console.error('Failed to deny access:', error);
                                                alert('An error occurred. Please try again.');
                                            }
                                        };

                                        const NotificationContent = (
                                            <div
                                                className={cn(
                                                    'flex items-start gap-3 p-4 transition-colors hover:bg-[var(--color-muted)]/50',
                                                    notification.readAt ? 'opacity-70' : 'bg-[var(--color-muted)]/20',
                                                    isAccessRequest ? '' : 'cursor-pointer',
                                                )}
                                            >
                                                <div className="mt-1 flex-shrink-0">
                                                    {notification.senderImage ? (
                                                        <Avatar
                                                            className="h-10 w-10 rounded-full"
                                                            image={notification.senderImage}
                                                            name={notification.senderName}
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)]">
                                                            <IconComponent className={cn('h-5 w-5', iconColor)} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="mb-1 text-sm font-semibold text-[var(--color-foreground)]">
                                                            {notification.senderName}
                                                        </p>
                                                        {!notification.readAt && (
                                                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-error)]"></span>
                                                        )}
                                                    </div>
                                                    <p className="mb-2 line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
                                                        {notification.message}
                                                    </p>
                                                    {isAccessRequest && notification.accessType && (
                                                        <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
                                                            Requested:{' '}
                                                            {notification.accessType === 'studio'
                                                                ? 'Studio'
                                                                : notification.accessType === 'cowork'
                                                                  ? 'Cowork'
                                                                  : 'Studio & Cowork'}
                                                        </p>
                                                    )}
                                                    {notification.type === 'access_request_response' && notification.denial_reason && (
                                                        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                                            <strong>Reason:</strong> {notification.denial_reason}
                                                        </div>
                                                    )}
                                                    {isAccessRequest && (
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                onClick={handleApproveAccess}
                                                                className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={handleDenyAccess}
                                                                className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                                                            >
                                                                Deny
                                                            </button>
                                                        </div>
                                                    )}
                                                    <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        );

                                        if (isAccessRequest) {
                                            return (
                                                <div key={notification.id} onClick={() => markAsRead(notification)}>
                                                    {NotificationContent}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={notification.id}
                                                href={notification.link}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    markAsRead(notification);
                                                }}
                                                className="block"
                                            >
                                                {NotificationContent}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Denial Reason Modal */}
            {denyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
                        <h3 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Deny Access Request</h3>
                        <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
                            Please provide a reason for denying this access request. The user will see this reason in their notification.
                        </p>
                        <textarea
                            value={denialReason}
                            onChange={(e) => setDenialReason(e.target.value)}
                            placeholder="Enter reason for denial..."
                            className="mb-4 min-h-[100px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-foreground)]"
                            maxLength={500}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDenyModalOpen(false);
                                    setDenyNotificationId(null);
                                    setDenialReason('');
                                }}
                                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-muted)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeny}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Deny Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
