// Notification manager for desktop and toast notifications
// Manager dial notifications bach n3tiw desktop notifications w toast notifications

let notificationPermission = null;

// Request notification permission
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

// Show desktop notification
export const showDesktopNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
        return null;
    }

    if (Notification.permission !== 'granted') {
        return null;
    }

    const defaultOptions = {
        icon: options.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'chat-message',
        requireInteraction: false,
        silent: false,
        ...options,
    };

    try {
        const notification = new Notification(title, defaultOptions);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        return notification;
    } catch (error) {
        console.error('Error showing desktop notification:', error);
        return null;
    }
};

// Check if notification permission is granted
export const hasNotificationPermission = () => {
    return 'Notification' in window && Notification.permission === 'granted';
};

