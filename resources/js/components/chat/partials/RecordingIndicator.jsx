// Recording indicator component
// Component bach n3rfo ila user kayrecord audio

import React from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecordingIndicator({ userName, isCurrentUser }) {
    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg mb-2",
            isCurrentUser ? "justify-end" : "justify-start"
        )}>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                <Mic className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-xs font-medium">
                    {userName} is recording
                </span>
            </div>
        </div>
    );
}

