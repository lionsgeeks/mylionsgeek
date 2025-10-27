import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Mail, UserPlus, X } from 'lucide-react';

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => {
    const [inviteType, setInviteType] = useState('email');
    const [emailList, setEmailList] = useState('');
    const [message, setMessage] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        emails: [],
        role: 'member',
        message: '',
        project_id: projectId
    });

    const handleEmailChange = (value) => {
        const emails = value.split(',').map(email => email.trim()).filter(email => email);
        setEmailList(value);
        setData('emails', emails);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (inviteType === 'email') {
            post('/admin/projects/invite', {
                onSuccess: () => {
                    reset();
                    setEmailList('');
                    setMessage('');
                    onClose();
                }
            });
        }
    };

    const handleClose = () => {
        reset();
        setEmailList('');
        setMessage('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-[var(--color-alpha)]" />
                        Invite to {projectName}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invite_type">Invite Type</Label>
                        <Select value={inviteType} onValueChange={setInviteType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email Invitation</SelectItem>
                                <SelectItem value="link">Share Link</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {inviteType === 'email' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="emails">Email Addresses *</Label>
                                <Textarea
                                    id="emails"
                                    placeholder="Enter email addresses separated by commas (e.g., john@example.com, jane@example.com)"
                                    value={emailList}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    className="min-h-[80px]"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate multiple emails with commas
                                </p>
                                {errors.emails && <p className="text-sm text-red-600">{errors.emails}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Personal Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Add a personal message to the invitation..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </>
                    )}

                    {inviteType === 'link' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="h-4 w-4 text-[var(--color-alpha)]" />
                                    <span className="font-medium">Share Link</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Copy this link and share it with people you want to invite to the project.
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={`${window.location.origin}/projects/${projectId}/join`}
                                        readOnly
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/projects/${projectId}/join`);
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        {inviteType === 'email' && (
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Sending...' : 'Send Invitations'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InviteModal;
