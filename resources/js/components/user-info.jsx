import { Avatar } from '@/components/ui/avatar';
import { resolveUserAvatarSrc } from '@/lib/userAvatar';

const normalizeRoles = (roleValue) => {
    if (!roleValue) return [];
    if (Array.isArray(roleValue)) return roleValue.filter(Boolean);
    return [roleValue].filter(Boolean);
};

const formatRoleLabel = (role) => {
    if (!role) return role;
    return role === 'studio_responsable' ? 'Responsable Studio' : role;
};

export function UserInfo({ user, showEmail = false, avatarOnly = false }) {
    const roles = normalizeRoles(user.role);
    const displayRoles = roles.length ? roles.map(formatRoleLabel).join(', ') : null;
    const avatarSrc = resolveUserAvatarSrc(user);
    const displayName = user.name || user.email || 'User';

    if (avatarOnly) {
        return (
            <Avatar
                className="h-8 w-8 overflow-hidden rounded-full"
                src={avatarSrc}
                name={displayName}
                lastActivity={user.last_login ?? user.last_online ?? user.last_activity ?? null}
                onlineCircleClass="hidden"
            />
        );
    }

    return (
        <>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {displayRoles && <span className="truncate text-xs font-extralight text-dark dark:text-white/80">{displayRoles}</span>}
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
            <Avatar
                className="h-8 w-8 overflow-hidden rounded-full"
                src={avatarSrc}
                name={displayName}
                lastActivity={user.last_login ?? user.last_online ?? user.last_activity ?? null}
                onlineCircleClass="hidden"
            />
        </>
    );
}
