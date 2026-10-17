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

export default function DeleteProgrammeModal({
    isOpen,
    onClose,
    onConfirm,
    item = null,
}) {
    if (!item) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md border border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light p-6 shadow-xl">
                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-xl font-bold flex items-center gap-3 text-dark dark:text-light">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <span>Delete this programme?</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs leading-relaxed text-dark/70 dark:text-light/70 pt-1">
                        Are you sure you want to delete <strong className="text-dark dark:text-light">{item.title || 'this programme'}</strong>? This action cannot be undone.
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
                            onConfirm(item.id);
                            onClose();
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs gap-1.5 shadow-sm"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Programme</span>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
