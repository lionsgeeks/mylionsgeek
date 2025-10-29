import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

const TeamMemberSelector = ({ selected, onSelect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isModalOpen && users.length === 0) {
            loadUsers();
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredUsers(users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())));
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const loadUsers = () => {
        setLoading(true);
        fetch('/admin/api/users', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((data) => {
                setUsers(Array.isArray(data) ? data : []);
                setFilteredUsers(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setUsers([]);
                setFilteredUsers([]);
            })
            .finally(() => setLoading(false));
    };

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
                    {selected.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 rounded-lg border p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.image} alt={member.name} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
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
                    ))}
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No team members selected</p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Team Members</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

                        {loading ? (
                            <p className="py-4 text-center text-sm">Loading...</p>
                        ) : filteredUsers.length > 0 ? (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => {
                                    const isSelected = selected.some((m) => m.id === user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-2 hover:bg-accent"
                                            onClick={() => handleToggle(user)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
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
                    <div className="border-t pt-4">
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
