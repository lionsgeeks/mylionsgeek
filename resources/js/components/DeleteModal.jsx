import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable delete confirmation modal
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - title?: string
 * - description?: string
 * - confirmLabel?: string
 * - cancelLabel?: string
 * - onConfirm: () => Promise<void> | void
 * - loading?: boolean
 */
export default function DeleteModal({
  open,
  onOpenChange,
  title = 'Delete item',
  description = 'This action cannot be undone. This will permanently delete the item.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  loading: loadingProp = false,
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = loadingProp || internalLoading;

  const handleConfirm = async () => {
    if (!onConfirm) return;
    try {
      const maybePromise = onConfirm();
      if (maybePromise && typeof maybePromise.then === 'function') {
        setInternalLoading(true);
        await maybePromise;
      }
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-light text-dark dark:bg-dark dark:text-light">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error">
              <AlertTriangle size={18} />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-dark dark:text-light">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button
            variant="secondary"
            className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            className="bg-error text-light hover:bg-error/90 disabled:opacity-70"
            onClick={handleConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


