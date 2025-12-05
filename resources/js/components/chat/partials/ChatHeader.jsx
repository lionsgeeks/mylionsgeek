import React from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';

// Header dial chatbox m3a 3amaliyet toolbox
export default function ChatHeader({ conversation, onClose, onBack, onToolboxToggle }) {
    return (
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0 bg-background">
            {onBack && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-10 w-10 md:hidden -ml-2"
                >
                    <X className="h-5 w-5" />
                </Button>
            )}
            <button
                onClick={() => router.visit(`/student/${conversation.other_user.id}`)}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
                <Avatar
                    className="h-11 w-11 flex-shrink-0 ring-2 ring-primary/10 cursor-pointer"
                    image={conversation.other_user.image}
                    name={conversation.other_user.name}
                />
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-base font-semibold truncate">{conversation.other_user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Active now</p>
                </div>
            </button>
            <Button
                variant="ghost"
                size="icon"
                onClick={onToolboxToggle}
                className="h-10 w-10 hover:bg-alpha/10"
                title="Toolbox"
            >
                <Info className="h-5 w-5 text-alpha" />
            </Button>
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-10 w-10"
                >
                    <X className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}

