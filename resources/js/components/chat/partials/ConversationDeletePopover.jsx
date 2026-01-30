import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Component dial popover dyal delete conversation
export default function ConversationDeletePopover({ conversationId, onDeleted }) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        router.delete(`/chat/conversation/${conversationId}`, {
            onSuccess: () => {
                setOpen(false);
                if (onDeleted) {
                    onDeleted();
                }
            },
            onError: () => {
                alert('Failed to delete conversation');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn('w-48 border-border bg-background p-1', 'dark:border-border dark:bg-dark_gray')} align="end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className={cn('w-full justify-start text-error hover:bg-error/10', 'dark:text-error dark:hover:bg-error/20')}
                >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    {deleting ? 'Deleting...' : 'Delete Conversation'}
                </Button>
            </PopoverContent>
        </Popover>
    );
}
