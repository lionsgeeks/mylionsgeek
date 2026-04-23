import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Info, X } from 'lucide-react';

const getOnlineMeta = (dateString) => {
    if (!dateString) {
        return { isOnline: false, label: 'Offline' };
    }

    const last = new Date(dateString);
    if (Number.isNaN(last.getTime())) {
        return { isOnline: false, label: 'Offline' };
    }

    const minutesSince = (Date.now() - last.getTime()) / (1000 * 60);
    const isOnline = minutesSince <= 5;
    return { isOnline, label: isOnline ? 'Active now' : `Last seen ${timeAgo(last)}` };
};

// Header dial chatbox m3a 3amaliyet toolbox
export default function ChatHeader({ conversation, onClose, onBack, onToolboxToggle }) {
    const { auth } = usePage().props;
    const roles = Array.isArray(auth?.user?.role) ? auth.user.role : auth?.user?.role ? [auth.user.role] : [];
    const isRecruiter = roles.includes('recruiter');
    const peer = conversation?.other_user ?? {};
    const lastActivityRaw = peer.last_login ?? peer.last_online ?? peer.last_activity ?? null;
    const onlineMeta = getOnlineMeta(lastActivityRaw);

    const openPeerProfile = () => {
        if (isRecruiter) {
            return;
        }
        if (peer?.id != null) {
            router.visit(`/students/${peer.id}`);
        }
    };

    return (
        <div className="flex shrink-0 items-center gap-3 border-b bg-background px-5 py-4">
            {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 h-10 w-10 md:hidden">
                    <X className="h-5 w-5" />
                </Button>
            )}
            <button
                type="button"
                onClick={openPeerProfile}
                className={`flex min-w-0 flex-1 items-center gap-3 ${isRecruiter ? 'cursor-default' : 'cursor-pointer transition-opacity hover:opacity-80'}`}
            >
                <Avatar
                    className="h-11 w-11 flex-shrink-0 cursor-pointer ring-2 ring-primary/10"
                    image={peer.image}
                    name={peer.name}
                    lastActivity={lastActivityRaw}
                />
                <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-base font-semibold">{peer.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{onlineMeta.label}</p>
                </div>
            </button>
            <Button variant="ghost" size="icon" onClick={onToolboxToggle} className="h-10 w-10 hover:bg-alpha/10" title="Toolbox">
                <Info className="h-5 w-5 text-alpha" />
            </Button>
            {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                    <X className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}
