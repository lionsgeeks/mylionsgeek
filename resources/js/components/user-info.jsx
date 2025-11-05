import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function UserInfo({ user, showEmail = false }) {
    const getInitials = useInitials();

    return (
        <>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate font-extralight text-xs text-dark dark:text-white/80">{user.role}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full" image={user.image} name={user.name} lastActivity={user.last_activity || null} onlineCircleClass="hidden" />
        </>
    );
}
