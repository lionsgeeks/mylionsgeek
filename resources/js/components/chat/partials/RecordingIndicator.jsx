// Recording indicator component
// Component bach n3rfo ila user kayrecord audio

import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

export default function RecordingIndicator({ userName, isCurrentUser }) {
    return (
        <div className={cn('mb-2 flex items-center gap-2 rounded-lg px-4 py-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
            <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-red-500">
                <Mic className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-xs font-medium">{userName} is recording</span>
            </div>
        </div>
    );
}
