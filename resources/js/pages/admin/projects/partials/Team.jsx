import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    MoreHorizontal, 
    MessageSquare, 
    Users, 
    Trash, 
    Plus,
    Search,
    Mail,
    UserPlus
} from 'lucide-react';

const Team = ({ teamMembers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({
        email: '',
        role: 'member'
    });

    const filteredMembers = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvite = () => {
        console.log('Inviting member:', inviteData);
        setInviteData({
            email: '',
            role: 'member'
        });
        setIsInviteModalOpen(false);
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            owner: { color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300", label: "Owner" },
            admin: { color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300", label: "Admin" },
            member: { color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", label: "Member" },
            viewer: { color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300", label: "Viewer" }
        };
        
        const config = roleConfig[role] || roleConfig.member;
        
        return (
            <Badge variant="outline" className={`${config.color} border-none`}>
                {config.label}
            </Badge>
        );
    };

    const getStatusIndicator = (status) => {
        return (
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                    status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="capitalize">{status}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search team members..." 
                            className="pl-8 w-[200px] md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                </Button>
            </div>

            {/* Team Members Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'No members match your search' : 'No team members yet'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-sm text-muted-foreground">{member.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(member.role || 'member')}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusIndicator(member.status || 'active')}
                                    </TableCell>
                                    <TableCell>
                                        {member.lastActive || 'Just now'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    <span>Message</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    <span>Send Email</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Users className="mr-2 h-4 w-4" />
                                                    <span>Change Role</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Remove</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Invite Member Modal */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join this project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={inviteData.email}
                                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                                placeholder="Enter email address"
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select 
                                value={inviteData.role} 
                                onValueChange={(value) => setInviteData({...inviteData, role: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p><strong>Viewer:</strong> Can view project content</p>
                            <p><strong>Member:</strong> Can edit and manage tasks</p>
                            <p><strong>Admin:</strong> Can manage project settings</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} disabled={!inviteData.email}>
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Team;
