import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveAs } from 'file-saver';
import { AlertTriangle, Award, Loader2 } from 'lucide-react';
import { useState } from 'react';

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Converts ISO date "YYYY-MM-DD" → display format "DD/MM/YYYY" for the certificate preview. */
const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d) return '';
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

/**
 * Resolves the certificate track from the user's field value.
 * Returns "coding", "media", or null (unknown field).
 * Exported so ProfileHeader can use it to decide whether to show the button.
 */
export const resolveCertificateTrack = (field) => {
    const normalized = String(field ?? '')
        .toLowerCase()
        .trim();
    if (!normalized) return null;
    if (normalized === 'coding' || normalized.includes('coding') || normalized.includes('code') || normalized.includes('dev')) {
        return 'coding';
    }
    if (normalized === 'media' || normalized.includes('media') || normalized.includes('content') || normalized.includes('studio')) {
        return 'media';
    }
    return null;
};

/**
 * Dialog that lets an admin download a single student's certificate PDF.
 * The admin picks a date; the server fills the PDF template and streams it back.
 */
export default function DownloadCertificateDialog({ open, onOpenChange, user }) {
    const [issuedDate, setIssuedDate] = useState(todayIso);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setIssuedDate(todayIso());
        setError('');
    };

    const handleOpenChange = (value) => {
        if (isDownloading) return;
        if (!value) reset();
        onOpenChange(value);
    };

    const handleDownload = async () => {
        if (!issuedDate || isDownloading) return;

        setIsDownloading(true);
        setError('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            const response = await fetch(`/admin/users/${user.id}/certificate/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/pdf, application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ issued_date: issuedDate }),
            });

            if (!response.ok) {
                let message = `Échec (${response.status})`;
                const contentType = response.headers.get('Content-Type') ?? '';
                if (contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data?.error) message = data.error;
                }
                throw new Error(message);
            }

            const blob = await response.blob();
            // Mirror the server filename format: certificate_first-last_DD-MM-YYYY.pdf
            const safeName = user.name.replace(/\s+/g, '_');
            const safeDate = issuedDate.split('-').reverse().join('-');
            saveAs(blob, `certificate_${safeName}_${safeDate}.pdf`);

            reset();
            onOpenChange(false);
        } catch (err) {
            setError(err?.message || 'Échec du téléchargement du certificat.');
        } finally {
            setIsDownloading(false);
        }
    };

    const datePreview = formatDisplayDate(issuedDate);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[95vw] max-w-md overflow-hidden border border-alpha/20 bg-light p-0 text-dark dark:bg-dark dark:text-light">
                {/* Header */}
                <div className="border-b border-alpha/10 px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Award className="h-5 w-5 flex-shrink-0 text-alpha" />
                        Télécharger le certificat
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Choisissez la date à imprimer sur le certificat de{' '}
                        <span className="font-semibold text-dark dark:text-light">{user.name}</span>.
                    </DialogDescription>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    <div>
                        <Label htmlFor="cert-issued-date">Date du certificat</Label>
                        <Input
                            id="cert-issued-date"
                            type="date"
                            value={issuedDate}
                            onChange={(e) => setIssuedDate(e.target.value)}
                            disabled={isDownloading}
                            className="mt-1"
                        />
                        {datePreview && (
                            <p className="mt-1 text-xs text-dark/50 dark:text-light/50">
                                Sur le certificat&nbsp;: <span className="font-mono">{datePreview}</span>
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-alpha/10 px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isDownloading}>
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDownload}
                        disabled={!issuedDate || isDownloading}
                        className="gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Génération…
                            </>
                        ) : (
                            <>
                                <Award className="h-4 w-4" />
                                Télécharger PDF
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
