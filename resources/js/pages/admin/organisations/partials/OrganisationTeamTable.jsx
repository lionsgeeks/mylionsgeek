import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { CircleCheckBig, Trash } from 'lucide-react';
import { useState } from 'react';

// Matches login check: 0 (or null) = active, 1 = suspended — same as organisation invites.
const isAccountActive = (accountState) => accountState === null || accountState === undefined || Number(accountState) === 0;

export default function OrganisationTeamTable({ teamMembers = [] }) {
    const [targetMember, setTargetMember] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const openToggleDialog = (member) => {
        setTargetMember(member);
        setOpenDialog(true);
    };

    const confirmToggle = () => {
        if (!targetMember) return;

        const newState = isAccountActive(targetMember.account_state) ? 1 : 0;

        router.post(
            `/admin/users/update/${targetMember.id}/account-state`,
            {
                _method: 'put',
                account_state: newState,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setOpenDialog(false);
                    setTargetMember(null);
                },
            },
        );
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teamMembers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                No team members for this organisation yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        teamMembers.map((member) => {
                            const active = isAccountActive(member.account_state);

                            return (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                className="h-8 w-8 overflow-hidden rounded-full"
                                                image={member.image}
                                                name={member.name}
                                                lastActivity={member.last_online ?? null}
                                                onlineCircleClass="hidden"
                                            />
                                            <span className="font-medium capitalize">{member.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {member.member_label ?? member.member_role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : ''}
                                        >
                                            {active ? 'Active' : 'Suspended'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            className="cursor-pointer bg-transparent p-2 duration-200 hover:bg-transparent"
                                            title={active ? 'Suspend account' : 'Activate account'}
                                            onClick={() => openToggleDialog(member)}
                                        >
                                            {active ? (
                                                <Trash size={22} className="text-error" />
                                            ) : (
                                                <CircleCheckBig size={22} className="text-green-600" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {openDialog && targetMember && (
                <AlertDialog open={openDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isAccountActive(targetMember.account_state) ? 'Suspend this account?' : 'Activate this account?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isAccountActive(targetMember.account_state)
                                    ? `${targetMember.name} will lose access until the account is reactivated.`
                                    : `${targetMember.name} will be able to sign in and use the recruiter workspace again.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer" onClick={() => setOpenDialog(false)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className={`cursor-pointer ${isAccountActive(targetMember.account_state) ? 'bg-error text-black hover:bg-error/80' : 'bg-alpha text-black hover:bg-alpha/80'}`}
                                onClick={confirmToggle}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
