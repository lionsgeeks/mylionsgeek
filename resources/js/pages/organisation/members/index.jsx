import RecruiterWorkspaceBanner from '@/components/recruiter/RecruiterWorkspaceBanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function OrganisationMembersIndex({ organization, employers }) {
    return (
        <AppLayout>
            <Head title="Team" />
            <div className="flex flex-col gap-8 p-6">
                <RecruiterWorkspaceBanner />
                <div>
                    <h1 className="text-2xl font-bold text-beta dark:text-light">Team</h1>
                    <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                        Employers linked to {organization?.display_name ?? 'your organisation'}.
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Added</TableHead>
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
                                        {employer.created_at ? new Date(employer.created_at).toLocaleDateString() : '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No employers yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
