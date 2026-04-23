import React from 'react';

export default function FullPageLoader({ isVisible }) {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] grid place-items-center bg-light/90 dark:bg-dark/90 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-alpha" />
                <p className="text-sm font-medium text-muted-foreground">Loading…</p>
            </div>
        </div>
    );
}

