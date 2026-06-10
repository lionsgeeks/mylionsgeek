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
import { router } from '@inertiajs/react';

export default function DeleteJobPostingDialog({ open, onOpenChange, job, deleteUrl }) {
    const applicationsCount = job?.applications_count ?? 0;
    const canDelete = job?.can_delete ?? applicationsCount === 0;

    const handleConfirm = () => {
        if (!job || !deleteUrl || !canDelete) {
            return;
        }

        router.delete(deleteUrl, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-light dark:bg-dark">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete job posting?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {canDelete ? (
                            <>
                                This will permanently remove <strong>{job?.title}</strong> ({job?.reference}). This action cannot be
                                undone.
                            </>
                        ) : (
                            <>
                                <strong>{job?.title}</strong> cannot be deleted because it has {applicationsCount} application
                                {applicationsCount === 1 ? '' : 's'}. Unpublish the posting or manage applications instead.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    {canDelete ? (
                        <AlertDialogAction
                            type="button"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleConfirm}
                        >
                            Delete
                        </AlertDialogAction>
                    ) : (
                        <AlertDialogAction type="button" onClick={() => onOpenChange(false)}>
                            OK
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
