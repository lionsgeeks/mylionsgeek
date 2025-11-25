import React, { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
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
        const sanitizedSelection = selected.filter(
            (member) => !hasAdminRole(member?.role ?? member?.roles)
        );
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
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                    className="bg-[#FFC801] hover:bg-neutral-900 hover:text-white text-black dark:bg-[#FFC801] dark:hover:bg-gray-200 dark:text-black cursor-pointer"
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
                            <div
                                key={member.id}
                                className="flex items-center gap-2 p-2 border border-border rounded-lg bg-white/80 dark:bg-[#111]"
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={member?.name || 'Member'}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
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
                <p className="text-sm text-muted-foreground text-center py-8">
                    No team members selected
                </p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col bg-light dark:bg-dark text-foreground border border-border">
                    <DialogHeader>
                        <DialogTitle>Select Team Members</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-[#0f0f0f]"
                        />

                        {users.length === 0 ? (
                            <p className="text-sm text-center py-4">No team members available</p>
                        ) : filteredUsers.length > 0 ? (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => {
                                    const isSelected = selected.some((m) => m.id === user.id);
                                    const avatar = (
                                        <div className="team-avatar relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase">
                                            {user?.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user?.name || 'Team member'}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
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
                                            className="flex items-center gap-3 p-3 border border-border rounded-lg bg-white/80 dark:bg-[#111] hover:bg-muted/60 cursor-pointer transition-colors"
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
                            <p className="text-sm text-center py-4">No users found</p>
                        )}
                    </div>

                    {/* Fixed Button at Bottom */}
                    <div className="pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-[#FFC801] hover:bg-neutral-900 text-black hover:text-white cursor-pointer dark:hover:bg-gray-200 dark:hover:text-black"
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
