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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight, CircleCheckBig, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrganisationsTable({ organisations }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [targetOrg, setTargetOrg] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(organisations.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = organisations.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [organisations]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const toggleStatus = (org) => {
        setTargetOrg(org);
        setOpenDialog(true);
    };

    const confirmToggle = () => {
        if (!targetOrg) return;
        const newState = targetOrg.account_state === 0 ? 1 : 0;
        router.put(
            `/admin/organisations/${targetOrg.id}/account-state`,
            { account_state: newState },
            {
                onSuccess: () => {
                    setOpenDialog(false);
                    setTargetOrg(null);
                },
                onFinish: () => {
                    setOpenDialog(false);
                    setTargetOrg(null);
                },
            },
        );
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead>Menu</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map((org) => (
                        <TableRow
                            key={org.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.visit(`/admin/organisations/${org.id}`)}
                        >
                            <TableCell className="font-medium">{org.enterprise_name || '—'}</TableCell>
                            <TableCell>{org.email}</TableCell>
                            <TableCell>{org.contact_name || '—'}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={org.onboarding_completed ? 'bg-alpha/20 text-black' : ''}>
                                    {org.onboarding_completed ? 'Complete' : 'Pending'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button
                                    type="button"
                                    className="cursor-pointer bg-transparent p-2 duration-200 hover:bg-transparent"
                                    title={org.account_state === 0 ? 'Suspend' : 'Activate'}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        toggleStatus(org);
                                    }}
                                >
                                    {org.account_state === 0 ? (
                                        <Trash size={25} className="text-error" />
                                    ) : (
                                        <CircleCheckBig size={25} className="text-green-600" />
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {openDialog && targetOrg && (
                <AlertDialog open={openDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Update organisation status?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {targetOrg.account_state === 0
                                    ? 'This will suspend the organisation and block access for its users.'
                                    : 'This will reactivate the organisation and restore access.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer" onClick={() => setOpenDialog(false)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="cursor-pointer bg-alpha text-black hover:bg-alpha/80" onClick={confirmToggle}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <div className="mt-10 flex w-full items-center justify-center gap-5">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-40 dark:bg-light dark:text-dark"
                >
                    <ChevronsLeft />
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-40 dark:bg-light dark:text-dark"
                >
                    <ChevronsRight />
                </button>
            </div>
        </div>
    );
}
