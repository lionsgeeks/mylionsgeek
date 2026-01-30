// Typing indicator component
// Component bach n3rfo ila user kaykteb

import { cn } from '@/lib/utils';

export default function TypingIndicator({ userName, isCurrentUser }) {
    return (
        <div className={cn('mb-2 flex items-center gap-2 rounded-lg px-4 py-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                <span className="text-xs text-muted-foreground">{userName} is typing</span>
                <div className="flex gap-1">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
