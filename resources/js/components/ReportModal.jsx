import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Flag } from 'lucide-react';
import { useEffect, useState } from 'react';

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 2000;

/**
 * Report post modal — required reason (min 10 chars) + submit.
 */
export default function ReportModal({ open, onOpenChange, onSubmit, postAuthorName }) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationError, setValidationError] = useState('');

    const trimmedLength = reason.trim().length;
    const canSubmit = trimmedLength >= MIN_REASON_LENGTH && !submitting;

    useEffect(() => {
        if (!open) {
            setReason('');
            setSubmitting(false);
            setStatus('idle');
            setErrorMessage('');
            setValidationError('');
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!onSubmit || submitting) return;

        const trimmed = reason.trim();
        if (trimmed.length < MIN_REASON_LENGTH) {
            setValidationError(`Please enter at least ${MIN_REASON_LENGTH} characters.`);
            return;
        }

        setSubmitting(true);
        setStatus('idle');
        setErrorMessage('');
        setValidationError('');

        try {
            await onSubmit(trimmed);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            setErrorMessage(
                error?.message ||
                    (typeof error === 'string' ? error : null) ||
                    'Failed to submit report. Please try again.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
            <DialogContent className="bg-light text-dark sm:max-w-[480px] dark:bg-dark dark:text-light">
                {status === 'success' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                                    <CheckCircle2 size={18} />
                                </span>
                                Report submitted
                            </DialogTitle>
                            <DialogDescription className="text-dark dark:text-light">
                                Thanks. Our team will review this post.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 sm:justify-end">
                            <Button
                                type="button"
                                className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark"
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error">
                                    <Flag size={18} />
                                </span>
                                Report post
                            </DialogTitle>
                            <DialogDescription className="text-dark dark:text-light">
                                {postAuthorName
                                    ? `Tell us what’s wrong with ${postAuthorName}’s post. Your report goes to our moderation team.`
                                    : 'Tell us what’s wrong with this post. Your report goes to our moderation team.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <label htmlFor="report-reason" className="text-sm font-semibold text-dark dark:text-light">
                                Reason <span className="text-error">*</span>
                            </label>
                            <Textarea
                                id="report-reason"
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value.slice(0, MAX_REASON_LENGTH));
                                    if (validationError) setValidationError('');
                                }}
                                placeholder="Spam, harassment, inappropriate content…"
                                rows={4}
                                disabled={submitting}
                                required
                                minLength={MIN_REASON_LENGTH}
                                className="resize-none bg-background text-dark dark:text-light"
                                aria-invalid={Boolean(validationError)}
                                aria-describedby="report-reason-hint"
                            />
                            <p
                                id="report-reason-hint"
                                className={`text-right text-xs ${
                                    trimmedLength > 0 && trimmedLength < MIN_REASON_LENGTH
                                        ? 'text-error'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {trimmedLength}/{MAX_REASON_LENGTH}
                                {trimmedLength > 0 && trimmedLength < MIN_REASON_LENGTH
                                    ? ` — at least ${MIN_REASON_LENGTH} characters required`
                                    : null}
                            </p>

                            {validationError ? (
                                <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                                    {validationError}
                                </p>
                            ) : null}

                            {status === 'error' ? (
                                <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>

                        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="bg-error text-light hover:bg-error/90 disabled:opacity-70"
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                            >
                                {submitting ? 'Submitting…' : 'Submit report'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
