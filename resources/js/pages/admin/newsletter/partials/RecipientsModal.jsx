import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo, useState } from 'react';

export default function RecipientsModal({
    open,
    setOpen,
    users = [],
    trainings = [],
    roles = [],
    recipientMode,
    setRecipientMode,
    selectedTrainingIds,
    setSelectedTrainingIds,
    selectAllTrainings,
    setSelectAllTrainings,
    selectedRoles,
    setSelectedRoles,
    selectAllRoles,
    setSelectAllRoles,
    selectedUserIds,
    setSelectedUserIds,
    recipientsCount,
}) {
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const searchedUsers = useMemo(() => {
        if (!userSearchQuery.trim()) return users;
        const q = userSearchQuery.toLowerCase();
        return users.filter(
            (user) => (user.name || '').toLowerCase().includes(q) || (user.email || '').toLowerCase().includes(q),
        );
    }, [userSearchQuery, users]);

    const clearTraining = () => {
        setSelectedTrainingIds([]);
        setSelectAllTrainings(false);
    };

    const clearRoles = () => {
        setSelectedRoles([]);
        setSelectAllRoles(false);
    };

    const clearUsers = () => {
        setSelectedUserIds([]);
        setUserSearchQuery('');
    };

    const handleModeChange = (mode) => {
        setRecipientMode(mode);
        if (mode === 'training') {
            clearRoles();
            clearUsers();
        } else if (mode === 'role') {
            clearTraining();
            clearUsers();
        } else {
            clearTraining();
            clearRoles();
        }
    };

    const handleTrainingToggle = (trainingId) => {
        if (trainingId === 'all') {
            setSelectAllTrainings(!selectAllTrainings);
            setSelectedTrainingIds([]);
            return;
        }

        const id = Number(trainingId);
        setSelectedTrainingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
        setSelectAllTrainings(false);
    };

    const handleRoleToggle = (role) => {
        if (role === 'all') {
            setSelectAllRoles(!selectAllRoles);
            setSelectedRoles([]);
            return;
        }

        setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
        setSelectAllRoles(false);
    };

    const formatRoleLabel = (role) =>
        role === 'studio_responsable' ? 'Responsable Studio' : role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] max-w-[90vw] min-w-[60vw] overflow-y-auto px-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold">Select recipients</DialogTitle>
                    <DialogDescription className="text-base">
                        Choose one method: by training, by role, or by individual users. Selections do not combine.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={recipientMode} onValueChange={handleModeChange} className="w-full">
                    <TabsList className="mb-4 grid h-auto w-full grid-cols-3 gap-1 bg-alpha/10 p-1 dark:bg-light/10">
                        <TabsTrigger
                            value="training"
                            className="data-[state=active]:bg-alpha data-[state=active]:text-black data-[state=active]:shadow-sm"
                        >
                            By Training
                        </TabsTrigger>
                        <TabsTrigger
                            value="role"
                            className="data-[state=active]:bg-alpha data-[state=active]:text-black data-[state=active]:shadow-sm"
                        >
                            By Role
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="data-[state=active]:bg-alpha data-[state=active]:text-black data-[state=active]:shadow-sm"
                        >
                            By User
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="training" className="mt-0 space-y-4">
                        <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
                            <Label className="text-base font-semibold">Select Training(s)</Label>

                            <div className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-alpha/10">
                                <Checkbox
                                    checked={selectAllTrainings}
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={() => handleTrainingToggle('all')}
                                />
                                <label
                                    onClick={() => handleTrainingToggle('all')}
                                    className="flex-1 cursor-pointer text-sm font-medium"
                                >
                                    All Trainings ({users.length} users)
                                </label>
                            </div>

                            <div className="max-h-70 space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
                                {trainings.map((t) => {
                                    const count = users.filter((u) => u.formation_id === t.id).length;
                                    const isSelected = selectedTrainingIds.includes(t.id);

                                    return (
                                        <div
                                            key={t.id}
                                            className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onClick={(e) => e.stopPropagation()}
                                                onCheckedChange={() => handleTrainingToggle(t.id)}
                                            />
                                            <label
                                                className="flex cursor-pointer flex-col"
                                                onClick={() => handleTrainingToggle(t.id)}
                                            >
                                                <span className="text-sm font-medium">
                                                    {t.name} <span className="text-muted-foreground">({count})</span>
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Coach: {t.coach?.name || '—'}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="role" className="mt-0 space-y-4">
                        <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
                            <Label className="text-base font-semibold">Select Role(s)</Label>

                            <div className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-alpha/10">
                                <Checkbox
                                    checked={selectAllRoles}
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={() => handleRoleToggle('all')}
                                />
                                <label className="flex-1 cursor-pointer text-sm" onClick={() => handleRoleToggle('all')}>
                                    All Roles ({users.length} users)
                                </label>
                            </div>

                            <div className="max-h-70 space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
                                {roles.map((role) => {
                                    const count = users.filter((u) => {
                                        const userRoles = Array.isArray(u.role) ? u.role : [u.role];
                                        return userRoles.some((r) => r?.toLowerCase() === role.toLowerCase());
                                    }).length;
                                    const isSelected = selectedRoles.includes(role.toLowerCase());

                                    return (
                                        <div
                                            key={role}
                                            className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onClick={(e) => e.stopPropagation()}
                                                onCheckedChange={() => handleRoleToggle(role.toLowerCase())}
                                            />
                                            <label
                                                className="flex flex-1 cursor-pointer items-center"
                                                onClick={() => handleRoleToggle(role.toLowerCase())}
                                            >
                                                <span className="text-sm font-medium">
                                                    {formatRoleLabel(role)}{' '}
                                                    <span className="text-muted-foreground">({count})</span>
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="mt-0 space-y-4">
                        <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
                            <Label className="text-base font-semibold">Select Individual Users</Label>
                            <Input
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="bg-[#e5e5e5] px-4 text-base text-black placeholder:text-[#0a0a0a]/50 focus:ring-2 focus:ring-alpha dark:bg-[#262626] dark:text-white dark:placeholder:text-white"
                            />

                            <div className="max-h-70 space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
                                {searchedUsers.length > 0 ? (
                                    searchedUsers.map((user) => {
                                        const isSelected = selectedUserIds.includes(user.id);
                                        const toggle = () =>
                                            setSelectedUserIds((prev) =>
                                                prev.includes(user.id)
                                                    ? prev.filter((id) => id !== user.id)
                                                    : [...prev, user.id],
                                            );

                                        return (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-alpha/10"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={toggle}
                                                />
                                                <label className="flex flex-1 cursor-pointer flex-col" onClick={toggle}>
                                                    <span className="text-sm font-medium">{user.name || 'No name'}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </label>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-muted-foreground">No user found</span>
                                )}
                            </div>

                            {selectedUserIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedUserIds([])}
                                    className="w-full py-2 text-sm"
                                >
                                    Clear User Selection ({selectedUserIds.length})
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm font-medium">
                        <span className="text-muted-foreground">Selected via {recipientMode}:</span>{' '}
                        <strong className="text-base text-foreground">{recipientsCount}</strong> user
                        {recipientsCount !== 1 && 's'}
                    </p>
                </div>

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="px-6 py-2.5 text-base">
                            Done
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
