import RecruiterWorkspaceBanner from '@/components/recruiter/RecruiterWorkspaceBanner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import InviteEmployerDialog from '@/pages/organisation/members/partials/InviteEmployerDialog';
import { Head, usePage } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function OrganisationMembersIndex({ organization, employers }) {
    const { flash } = usePage().props;
    const [inviteOpen, setInviteOpen] = useState(false);

    return (
        <AppLayout>
            <Head title="Team" />
            <div className="flex flex-col gap-8 p-6">
                <RecruiterWorkspaceBanner />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-beta dark:text-light">Team</h1>
                        <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                            Manage employers for {organization?.display_name ?? 'your organisation'}.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite employer
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                {flash?.warning && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        {flash.warning}
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Invited</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employers?.length ? (
                            employers.map((employer) => (
                                <TableRow key={employer.id}>
                                    <TableCell className="font-medium">{employer.name}</TableCell>
                                    <TableCell>{employer.email}</TableCell>
                                    <TableCell className="capitalize">{employer.member_role}</TableCell>
                                    <TableCell>
                                        {employer.created_at
                                            ? new Date(employer.created_at).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No employers invited yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <InviteEmployerDialog open={inviteOpen} setOpen={setInviteOpen} />
            </div>
        </AppLayout>
    );
}
