import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveAs } from 'file-saver';
import { AlertTriangle, Award, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

const AttendanceBadge = ({ score }) => {
    const pct = Math.round(score);
    const colour =
        pct >= 80
            ? 'bg-green-500/15 text-green-600 dark:text-green-400 ring-green-500/30'
            : pct >= 60
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30'
              : 'bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30';
    return (
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${colour}`} title="Attendance rate">
            {pct}%
        </span>
    );
};

const resolveTrack = (field) => {
    const normalized = String(field || '')
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

const trackLabel = (field) => {
    if (resolveTrack(field) === 'coding') return 'Coding / Web Development';
    if (resolveTrack(field) === 'media') return 'UGC Creator / Digital Marketing';
    return null;
};

const formatPreviewDate = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d) return '';
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function CertificateModal({ open, onOpenChange, training }) {
    const students = training?.users ?? training?.students ?? [];

    const [selectedIds, setSelectedIds] = useState([]);
    const [issuedDate, setIssuedDate] = useState(todayIso);
    const [regenerate, setRegenerate] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [warnings, setWarnings] = useState([]);
    const [error, setError] = useState('');

    const allSelected = students.length > 0 && selectedIds.length === students.length;

    const toggleSelectAll = useCallback(() => {
        setSelectedIds(allSelected ? [] : students.map((s) => s.id));
    }, [allSelected, students]);

    const toggleStudent = useCallback((id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const resetForm = useCallback(() => {
        setSelectedIds([]);
        setIssuedDate(todayIso());
        setRegenerate(false);
        setWarnings([]);
        setError('');
    }, []);

    const handleConfirm = async () => {
        if (selectedIds.length === 0 || !issuedDate || isGenerating) return;

        setIsGenerating(true);
        setError('');
        setWarnings([]);

        try {
            const response = await fetch(`/trainings/${training.id}/certificates/zip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json, application/zip',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    user_ids: selectedIds,
                    issued_date: issuedDate,
                    regenerate,
                }),
            });

            let parsedWarnings = [];
            const warningsHeader = response.headers.get('X-Certificate-Warnings');
            if (warningsHeader) {
                try {
                    const parsed = JSON.parse(warningsHeader);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        parsedWarnings = parsed;
                        setWarnings(parsed);
                    }
                } catch {
                    /* ignore */
                }
            }

            if (!response.ok) {
                let message = `Failed (${response.status})`;
                const contentType = response.headers.get('Content-Type') || '';
                if (contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data?.error) message = data.error;
                    if (Array.isArray(data?.skipped) && data.skipped.length > 0) {
                        setWarnings(data.skipped);
                    }
                } else {
                    const bodyText = await response.text().catch(() => '');
                    if (bodyText) message = bodyText.slice(0, 200);
                }
                throw new Error(message);
            }

            const zipBlob = await response.blob();
            saveAs(zipBlob, `certificates-${training.id}.zip`);

            if (parsedWarnings.length === 0) {
                resetForm();
                onOpenChange(false);
            }
        } catch (err) {
            console.error('Certificate generation failed:', err);
            setError(err?.message || 'Certificate generation failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenChange = (value) => {
        if (!isGenerating) {
            if (!value) resetForm();
            onOpenChange(value);
        }
    };

    const datePreview = formatPreviewDate(issuedDate);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[95vw] max-w-5xl overflow-hidden border border-alpha/20 bg-light p-0 text-dark dark:bg-dark dark:text-light">
                <div className="border-b border-alpha/10 px-8 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Award className="h-6 w-6 flex-shrink-0 text-alpha" />
                        Print Certificates
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Select students and the date to print on the certificate (
                        <span className="font-mono text-xs">DD/MM/YYYY</span>).
                    </DialogDescription>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="certificate-issued-date">Certificate Date</Label>
                            <Input
                                id="certificate-issued-date"
                                type="date"
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                disabled={isGenerating}
                                className="mt-1"
                            />
                            {datePreview && (
                                <p className="mt-1 text-xs text-dark/50 dark:text-light/50">On the certificate: {datePreview}</p>
                            )}
                        </div>
                        <div className="flex items-end">
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-alpha/15 p-3">
                                <Checkbox
                                    checked={regenerate}
                                    onCheckedChange={(v) => setRegenerate(Boolean(v))}
                                    disabled={isGenerating}
                                    className="mt-0.5"
                                />
                                <span className="text-sm leading-snug">
                                    <span className="font-semibold">Regenerate existing certificates</span>
                                    <span className="mt-0.5 block text-xs text-dark/55 dark:text-light/55">
                                        Replaces already saved PDFs with the new date and current name.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-dark/60 dark:text-light/60">
                            <span className="font-bold text-alpha">{selectedIds.length}</span>
                            {' / '}
                            {students.length} selected
                        </span>
                        <button type="button" onClick={toggleSelectAll} className="text-sm font-semibold text-alpha hover:underline">
                            {allSelected ? 'Deselect all' : 'Select all'}
                        </button>
                    </div>
                </div>

                {(error || warnings.length > 0) && (
                    <div className="border-b border-amber-500/20 bg-amber-500/10 px-8 py-3">
                        {error && (
                            <p className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                {error}
                            </p>
                        )}
                        {warnings.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-amber-900 dark:text-amber-100">
                                {warnings.map((w) => (
                                    <li key={w.id ?? w.name}>
                                        <span className="font-semibold">{w.name}</span>
                                        {w.reason ? ` — ${w.reason}` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="max-h-[55vh] overflow-y-auto px-8 py-4">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-dark/40 dark:text-light/40">
                            <Award className="h-12 w-12 opacity-30" />
                            <p className="text-sm">No students enrolled in this training.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {students.map((student) => {
                                const checked = selectedIds.includes(student.id);
                                const track = trackLabel(student.field);
                                const invalidTrack = !resolveTrack(student.field);

                                return (
                                    <label
                                        key={student.id}
                                        htmlFor={`cert-student-${student.id}`}
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-150 ${
                                            checked
                                                ? 'border-alpha/40 bg-alpha/10 shadow-sm'
                                                : 'border-alpha/10 bg-light hover:border-alpha/30 hover:bg-alpha/5 dark:bg-dark'
                                        }`}
                                    >
                                        <Checkbox
                                            id={`cert-student-${student.id}`}
                                            checked={checked}
                                            onCheckedChange={() => toggleStudent(student.id)}
                                            className="h-5 w-5 flex-shrink-0 data-[state=checked]:border-alpha data-[state=checked]:bg-alpha"
                                        />

                                        <Avatar
                                            name={student.name}
                                            image={student.image ?? null}
                                            lastActivity={student.last_login ?? student.last_online ?? student.last_activity ?? null}
                                            className="h-12 w-12 flex-shrink-0 text-base"
                                            onlineCircleClass="w-3.5 h-3.5"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm leading-tight font-bold text-dark dark:text-light">{student.name}</p>
                                            {track && (
                                                <p className="mt-0.5 truncate text-xs text-dark/55 dark:text-light/55">{track}</p>
                                            )}
                                            {invalidTrack && (
                                                <p className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                    Invalid field — will be skipped
                                                </p>
                                            )}
                                            {student.email && (
                                                <p className="mt-0.5 truncate text-xs text-dark/40 dark:text-light/40">{student.email}</p>
                                            )}
                                        </div>

                                        {student.discipline != null && <AttendanceBadge score={student.discipline} />}

                                        {checked && (
                                            <span className="flex-shrink-0 rounded-full bg-alpha/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-alpha uppercase">
                                                ✓
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-stretch justify-between gap-3 border-t border-alpha/10 px-8 py-4 sm:flex-row sm:items-center">
                    <p className="hidden text-xs text-dark/50 sm:block dark:text-light/50">One PDF per student · reuses existing files unless regeneration is enabled</p>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isGenerating} className="flex-1 sm:flex-none">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0 || !issuedDate || isGenerating}
                            className="flex-1 gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4" />
                                    Confirm ({selectedIds.length})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
