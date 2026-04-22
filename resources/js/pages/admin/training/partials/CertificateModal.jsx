import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { saveAs } from 'file-saver';
import { Award, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

/**
 * Coloured pill showing the student's attendance/discipline score.
 * Green ≥ 80 · Amber 60–79 · Red < 60
 */
const AttendanceBadge = ({ score }) => {
    const pct = Math.round(score);
    const colour =
        pct >= 80
            ? 'bg-green-500/15 text-green-600 dark:text-green-400 ring-green-500/30'
            : pct >= 60
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30'
              : 'bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30';
    return (
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${colour}`} title="Taux de présence">
            {pct}%
        </span>
    );
};

// Maps a student's field/role to the display title on the certificate
const resolveTitle = (field) => {
    const normalized = String(field || '').toLowerCase();
    if (normalized.includes('coding') || normalized.includes('code') || normalized.includes('dev')) {
        return 'Full Stack Developer';
    }
    if (normalized.includes('media') || normalized.includes('content') || normalized.includes('studio')) {
        return 'Content Creator';
    }
    return field || '';
};

export default function CertificateModal({ open, onOpenChange, training }) {
    const students = training?.users ?? training?.students ?? [];

    const [selectedIds, setSelectedIds] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const allSelected = students.length > 0 && selectedIds.length === students.length;

    const toggleSelectAll = useCallback(() => {
        setSelectedIds(allSelected ? [] : students.map((s) => s.id));
    }, [allSelected, students]);

    const toggleStudent = useCallback((id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const handleConfirm = async () => {
        if (selectedIds.length === 0 || isGenerating) return;

        setIsGenerating(true);
        try {
            const response = await fetch(`/trainings/${training.id}/certificates/zip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ user_ids: selectedIds }),
            });

            if (!response.ok) {
                const bodyText = await response.text().catch(() => '');
                throw new Error(`Certificate ZIP request failed (${response.status}). ${bodyText}`);
            }

            const zipBlob = await response.blob();
            saveAs(zipBlob, `certificats-${training.id}.zip`);

            // Close modal after successful generation + download trigger
            setSelectedIds([]);
            onOpenChange(false);
        } catch (error) {
            console.error('Certificate generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenChange = (value) => {
        if (!isGenerating) {
            if (!value) setSelectedIds([]);
            onOpenChange(value);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[95vw] max-w-3xl overflow-hidden border border-alpha/20 bg-light p-0 text-dark dark:bg-dark dark:text-light">
                {/* ── Header ── */}
                <div className="border-b border-alpha/10 px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Award className="h-6 w-6 flex-shrink-0 text-alpha" />
                        Imprimer Certificats
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Sélectionnez les étudiants qui ont complété{' '}
                        <span className="font-semibold text-dark dark:text-light">{training.name ?? training.title}</span> pour générer leurs
                        certificats.
                    </DialogDescription>

                    {/* Select-all bar */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-dark/60 dark:text-light/60">
                            <span className="font-bold text-alpha">{selectedIds.length}</span>
                            {' / '}
                            {students.length} sélectionné{selectedIds.length !== 1 ? 's' : ''}
                        </span>
                        <button type="button" onClick={toggleSelectAll} className="text-sm font-semibold text-alpha hover:underline">
                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                    </div>
                </div>

                {/* ── Student grid ── */}
                <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-dark/40 dark:text-light/40">
                            <Award className="h-12 w-12 opacity-30" />
                            <p className="text-sm">Aucun étudiant inscrit à cette formation.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                            {students.map((student) => {
                                const checked = selectedIds.includes(student.id);
                                const displayTitle = resolveTitle(student.field ?? student.specialite ?? student.domain ?? '');
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
                                        {/* Checkbox */}
                                        <Checkbox
                                            id={`cert-student-${student.id}`}
                                            checked={checked}
                                            onCheckedChange={() => toggleStudent(student.id)}
                                            className="h-5 w-5 flex-shrink-0 data-[state=checked]:border-alpha data-[state=checked]:bg-alpha"
                                        />

                                        {/* Avatar */}
                                        <Avatar
                                            name={student.name}
                                            image={student.image ?? null}
                                            lastActivity={student.last_activity ?? null}
                                            className="h-12 w-12 flex-shrink-0 text-base"
                                            onlineCircleClass="w-3.5 h-3.5"
                                        />

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm leading-tight font-bold text-dark dark:text-light">{student.name}</p>
                                            {displayTitle && (
                                                <p className="mt-0.5 truncate text-xs text-dark/55 dark:text-light/55">{displayTitle}</p>
                                            )}
                                            {student.email && (
                                                <p className="mt-0.5 truncate text-xs text-dark/40 dark:text-light/40">{student.email}</p>
                                            )}
                                        </div>

                                        {/* Attendance / discipline badge */}
                                        {student.discipline != null && <AttendanceBadge score={student.discipline} />}

                                        {/* Selected checkmark */}
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

                {/* ── Footer ── */}
                <div className="flex flex-col items-stretch justify-between gap-3 border-t border-alpha/10 px-6 py-4 sm:flex-row sm:items-center">
                    <p className="hidden text-xs text-dark/50 sm:block dark:text-light/50">Un PDF par étudiant · téléchargé en .zip</p>
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isGenerating}
                            className="flex-1 sm:flex-none"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0 || isGenerating}
                            className="flex-1 gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Génération…
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4" />
                                    Confirmer ({selectedIds.length})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
