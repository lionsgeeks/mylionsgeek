import {
    homeReminderBannerText,
    reminderDismissKey,
    shouldShowHomeReminderBanner,
} from '@/lib/attendance-slots';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Clock, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const POLL_INTERVAL_MS = 60_000;

export default function StudentAttendanceReminderBanner() {
    const { auth } = usePage().props;
    const userRoles = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role].filter(Boolean);
    const isStudent = userRoles.includes('student');

    const [slotStatus, setSlotStatus] = useState(null);
    const [dismissedKeys, setDismissedKeys] = useState(() => new Set());
    const [tabVisible, setTabVisible] = useState(() => !document.hidden);

    const refreshSlotStatus = useCallback(async () => {
        if (!isStudent) {
            return;
        }

        try {
            const response = await fetch('/students/attendance/home-slot-status', {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setSlotStatus(data.slot_status ?? null);
        } catch {
            // ignore polling errors
        }
    }, [isStudent]);

    useEffect(() => {
        if (!isStudent) {
            return undefined;
        }

        const handleVisibilityChange = () => {
            setTabVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isStudent]);

    useEffect(() => {
        if (!isStudent || !tabVisible) {
            return undefined;
        }

        refreshSlotStatus();

        const interval = setInterval(refreshSlotStatus, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isStudent, tabVisible, refreshSlotStatus]);

    const dismissKey = useMemo(() => reminderDismissKey(slotStatus), [slotStatus]);

    const visible = useMemo(() => {
        if (!shouldShowHomeReminderBanner(slotStatus)) {
            return false;
        }

        return dismissKey !== null && !dismissedKeys.has(dismissKey);
    }, [slotStatus, dismissKey, dismissedKeys]);

    if (!isStudent || !visible || !slotStatus?.current_slot) {
        return null;
    }

    const bannerText = homeReminderBannerText(slotStatus);

    const handleDismiss = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (dismissKey) {
            setDismissedKeys((prev) => new Set(prev).add(dismissKey));
        }
    };

    return (
        <div
            key={dismissKey}
            className={cn(
                'pointer-events-auto fixed top-24 right-4 z-40 w-[calc(100%-2rem)] max-w-sm',
                'rounded-xl border border-alpha/20 bg-background/95 shadow-lg backdrop-blur-sm',
                'duration-300 animate-in slide-in-from-right fade-in',
            )}
        >
            <div
                role="link"
                tabIndex={0}
                className="group flex cursor-pointer items-start gap-3 p-4 text-foreground transition-colors hover:opacity-90"
                onClick={() => router.visit('/students/attendance')}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        router.visit('/students/attendance');
                    }
                }}
            >
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-alpha" />
                <p className="flex-1 text-sm leading-snug">{bannerText}</p>
                <button
                    type="button"
                    aria-label="Dismiss attendance reminder"
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
                    onClick={handleDismiss}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
