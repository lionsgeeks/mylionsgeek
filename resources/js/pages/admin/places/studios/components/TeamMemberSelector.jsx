import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
const normalizeRoles = (rawRoles) => {
    if (!rawRoles) return [];
    const roles = [];
    const pushRole = (role) => {
        if (!role && role !== 0) return;
        if (typeof role === 'string') {
            const trimmed = role.trim();
            if (!trimmed) return;
            roles.push(trimmed.toLowerCase());
            return;
        }
        if (typeof role === 'number') {
            roles.push(String(role).toLowerCase());
            return;
        }
        if (Array.isArray(role)) {
            role.forEach((r) => pushRole(r));
            return;
        }
        if (typeof role === 'object') {
            Object.values(role).forEach((r) => pushRole(r));
            return;
        }
    };

    if (Array.isArray(rawRoles)) {
        rawRoles.forEach((role) => pushRole(role));
    } else if (typeof rawRoles === 'string') {
        const trimmed = rawRoles.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                pushRole(parsed);
            } catch (e) {
                trimmed.split(',').forEach((chunk) => pushRole(chunk));
            }
        } else if (trimmed.includes(',')) {
            trimmed.split(',').forEach((chunk) => pushRole(chunk));
        } else {
            pushRole(trimmed);
        }
    } else if (typeof rawRoles === 'object') {
        pushRole(rawRoles);
    } else {
        pushRole(rawRoles);
    }

    return roles.filter(Boolean);
};

const hasAdminRole = (rawRoles) => {
    const roles = normalizeRoles(rawRoles);
    return roles.includes('admin') || roles.includes('moderateur');
};

const TeamMemberSelector = ({ selected, onSelect, teamMemberOptions = [] }) => {
    const { auth } = usePage().props;
    const viewerIsAdmin = hasAdminRole(auth?.user?.role);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const normalizeImage = (image) => {
        if (!image) return null;
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
        if (image.startsWith('/')) return image;
        if (image.startsWith('storage/')) return `/${image}`;
        if (image.startsWith('public/')) return `/${image.replace(/^public\//, 'storage/')}`;
        if (image.startsWith('img/')) return `/storage/${image}`;
        return `/storage/${image.replace(/^\/?/, '')}`;
    };

    const users = useMemo(() => {
        if (!Array.isArray(teamMemberOptions)) return [];
        return teamMemberOptions
            .filter((user) => viewerIsAdmin || !hasAdminRole(user?.role ?? user?.roles))
            .map((user) => ({
                ...user,
                image: normalizeImage(user.image),
            }));
    }, [teamMemberOptions, viewerIsAdmin]);

    useEffect(() => {
        if (viewerIsAdmin) return;
        const sanitizedSelection = selected.filter((member) => !hasAdminRole(member?.role ?? member?.roles));
        if (sanitizedSelection.length !== selected.length) {
            onSelect(sanitizedSelection);
        }
    }, [viewerIsAdmin, selected, onSelect]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter((u) => (u.name || '').toLowerCase().includes(query));
    }, [users, searchQuery]);

    const handleToggle = (user) => {
        const isSelected = selected.some((m) => m.id === user.id);
        if (isSelected) {
            onSelect(selected.filter((m) => m.id !== user.id));
        } else {
            onSelect([...selected, user]);
        }
    };

    const handleRemove = (userId) => {
        onSelect(selected.filter((m) => m.id !== userId));
    };
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Team Members ({selected.length})</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer bg-[#FFC801] text-black hover:bg-neutral-900 hover:text-white dark:bg-[#FFC801] dark:text-black dark:hover:bg-gray-200"
                >
                    Add Team Member
                </Button>
            </div>

            {/* Selected Members */}
            {selected.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {selected.map((member) => {
                        const image = normalizeImage(member?.image);
                        return (
                            <div key={member.id} className="flex items-center gap-2 rounded-lg border border-border bg-white/80 p-2 dark:bg-[#111]">
                                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-semibold text-muted-foreground uppercase">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={member?.name || 'Member'}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                            onError={(e) => e.currentTarget.remove()}
                                        />
                                    ) : (
                                        getInitials(member?.name)
                                    )}
                                </div>
                                <span className="flex-1 text-sm">{member.name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(member.id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                    ×
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No team members selected</p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flex max-h-[80vh] max-w-md flex-col border border-border bg-light text-foreground dark:bg-dark">
                    <DialogHeader>
                        <DialogTitle>Select Team Members</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-[#0f0f0f]"
                        />

                        {users.length === 0 ? (
                            <p className="py-4 text-center text-sm">No team members available</p>
                        ) : filteredUsers.length > 0 ? (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => {
                                    const isSelected = selected.some((m) => m.id === user.id);
                                    const avatar = (
                                        <div className="team-avatar relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-semibold text-muted-foreground uppercase">
                                            {user?.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user?.name || 'Team member'}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.remove();
                                                    }}
                                                />
                                            ) : (
                                                getInitials(user?.name)
                                            )}
                                        </div>
                                    );
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-white/80 p-3 transition-colors hover:bg-muted/60 dark:bg-[#111]"
                                            onClick={() => handleToggle(user)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            {avatar}
                                            <span className="flex-1 text-sm">{user.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm">No users found</p>
                        )}
                    </div>

                    {/* Fixed Button at Bottom */}
                    <div className="border-t border-border pt-4">
                        <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full cursor-pointer bg-[#FFC801] text-black hover:bg-neutral-900 hover:text-white dark:hover:bg-gray-200 dark:hover:text-black"
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamMemberSelector;
