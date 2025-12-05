// Typing indicator component
// Component bach n3rfo ila user kaykteb

import React from 'react';
import { cn } from '@/lib/utils';

export default function TypingIndicator({ userName, isCurrentUser }) {
    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg mb-2",
            isCurrentUser ? "justify-end" : "justify-start"
        )}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <span className="text-xs text-muted-foreground">
                    {userName} is typing
                </span>
                <div className="flex gap-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

