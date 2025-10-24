import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    UserPlus, 
    MoreVertical, 
    Crown, 
    Shield, 
    User, 
    Mail,
    Calendar,
    Trash,
    Edit
} from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    pivot: {
        role: 'owner' | 'admin' | 'member';
        invited_at?: string;
        joined_at?: string;
    };
}

interface TeamManagerProps {
    teamMembers: TeamMember[];
    availableUsers: Array<{ id: number; name: string; email: string }>;
    onInviteUser: (userId: number, role: string) => void;
    onRemoveUser: (userId: number) => void;
    onUpdateRole: (userId: number, role: string) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({
    teamMembers,
    availableUsers,
    onInviteUser,
    onRemoveUser,
    onUpdateRole
}) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: inviteData, setData: setInviteData, processing } = useForm({
        user_id: '',
        role: 'member'
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
            case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
            case 'member': return <User className="h-4 w-4 text-gray-600" />;
            default: return <User className="h-4 w-4 text-gray-600" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-yellow-100 text-yellow-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'member': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'owner': return 'Full access to project and team management';
            case 'admin': return 'Can manage tasks and invite members';
            case 'member': return 'Can view and participate in tasks';
            default: return 'Team member';
        }
    };

    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();
        onInviteUser(parseInt(inviteData.user_id), inviteData.role);
        setIsInviteModalOpen(false);
        setInviteData({ user_id: '', role: 'member' });
    };

    const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableUsersFiltered = availableUsers.filter(user =>
        !teamMembers.some(member => member.id === user.id)
    );

    const teamStats = {
        total: teamMembers.length,
        owners: teamMembers.filter(m => m.pivot.role === 'owner').length,
        admins: teamMembers.filter(m => m.pivot.role === 'admin').length,
        members: teamMembers.filter(m => m.pivot.role === 'member').length
    };

    return (
        <div className="space-y-6">
            {/* Team Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Members</p>
                                <p className="text-2xl font-bold">{teamStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Crown className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium">Owners</p>
                                <p className="text-2xl font-bold">{teamStats.owners}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Admins</p>
                                <p className="text-2xl font-bold">{teamStats.admins}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-600" />
                            <div>
                                <p className="text-sm font-medium">Members</p>
                                <p className="text-2xl font-bold">{teamStats.members}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Team Members</CardTitle>
                        <Button 
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                        <Input
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Team Members Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.map((member) => (
                            <Card key={member.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback>
                                                {member.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{member.name}</h3>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                            <Badge className={`mt-1 ${getRoleColor(member.pivot.role)}`}>
                                                {getRoleIcon(member.pivot.role)}
                                                <span className="ml-1 capitalize">{member.pivot.role}</span>
                                            </Badge>
                                            <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {member.pivot.joined_at 
                                                        ? `Joined ${new Date(member.pivot.joined_at).toLocaleDateString()}`
                                                        : 'Invited'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                                                    <User className="h-4 w-4 mr-2" />
                                                    Make Member
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => onRemoveUser(member.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredMembers.length === 0 && (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No team members found</h3>
                            <p className="text-muted-foreground">Invite members to collaborate on this project.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Crown className="h-5 w-5 text-yellow-600" />
                                <h3 className="font-medium">Owner</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Full access to project and team management. Can delete project and manage all aspects.
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <h3 className="font-medium">Admin</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Can manage tasks, invite members, and access most project features.
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <User className="h-5 w-5 text-gray-600" />
                                <h3 className="font-medium">Member</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Can view and participate in tasks, add comments, and upload files.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invite User Modal */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInviteUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">Select User</Label>
                            <Select value={inviteData.user_id} onValueChange={(value) => setInviteData('user_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user to invite" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsersFiltered.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={inviteData.role} onValueChange={(value) => setInviteData('role', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {getRoleDescription(inviteData.role)}
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Inviting...' : 'Send Invitation'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamManager;
