import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function timeAgo(dateString: string | Date): string {
    const now = new Date();
    const postDate = new Date(dateString);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000); // Convert milliseconds to seconds

    // Define the intervals for time units (seconds, minutes, hours, etc.)
    const intervals = [
        { label: 'year', seconds: 31536000 }, // 60 * 60 * 24 * 365
        { label: 'month', seconds: 2592000 }, // 60 * 60 * 24 * 30
        { label: 'day', seconds: 86400 }, // 60 * 60 * 24
        { label: 'hour', seconds: 3600 }, // 60 * 60
        { label: 'minute', seconds: 60 }, // 60
        { label: 'second', seconds: 1 },
    ];

    // Loop through the intervals and find the largest interval that fits the time difference
    for (let i = 0; i < intervals.length; i++) {
        const interval = Math.floor(seconds / intervals[i].seconds); // Calculate how many of the current interval fit into the time difference
        if (interval >= 1) {
            return `${interval} ${intervals[i].label}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now'; // If no significant time difference, return 'just now'
}
