import React from 'react';
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
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteWeekModal({
    isOpen,
    onClose,
    onConfirm,
    week = null,
    affectedItemsCount = 0,
}) {
    if (!week) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md border border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light p-6 shadow-xl">
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-xl font-bold flex items-center gap-3 text-dark dark:text-light">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <span>Remove {week.label}?</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs leading-relaxed text-dark/70 dark:text-light/70 pt-1">
                        {affectedItemsCount > 0 ? (
                            <>
                                This will remove <strong>{week.label}</strong> and <strong className="text-red-600 dark:text-red-400">{affectedItemsCount} programme block{affectedItemsCount === 1 ? '' : 's'}</strong> inside it. This action cannot be undone.
                            </>
                        ) : (
                            <>
                                This will remove <strong>{week.label}</strong> from the programme grid. This action cannot be undone.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-alpha/15 mt-4">
                    <AlertDialogCancel
                        type="button"
                        onClick={onClose}
                        className="border-alpha/30 text-xs font-semibold hover:bg-alpha/10"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        onClick={() => {
                            onConfirm(week);
                            onClose();
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs gap-1.5 shadow-sm"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Week</span>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
