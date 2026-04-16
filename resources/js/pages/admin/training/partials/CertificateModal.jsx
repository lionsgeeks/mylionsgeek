import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

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

/**
 * Loads an image from a URL and returns an HTMLImageElement via Promise.
 * Rejects cleanly if the image fails to load so downstream callers can surface the error.
 */
const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load certificate template: ${src}`));
        img.src = src;
    });

/**
 * Generates a single A4-landscape PDF containing the certificate for one student.
 * Returns the PDF as a Blob.
 */
const generateCertificatePdf = async (student, trainingTitle, templateSrc) => {
    const templateImg = await loadImage(templateSrc);

    // A4 landscape in px at 96 dpi: 1122 × 794
    const A4_W = 1122;
    const A4_H = 794;

    const canvas = document.createElement('canvas');
    canvas.width = A4_W;
    canvas.height = A4_H;
    const ctx = canvas.getContext('2d');

    // Draw the template scaled to fill the entire canvas
    ctx.drawImage(templateImg, 0, 0, A4_W, A4_H);

    const centerX = A4_W / 2;

    // Student name — large, centred, dark
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillStyle = '#2c2c2c';
    ctx.fillText(student.name, centerX, 440);

    // Resolved title (Full Stack Developer / Content Creator / raw field)
    const displayTitle = resolveTitle(student.field ?? student.specialite ?? student.domain ?? '');
    if (displayTitle) {
        ctx.font = '36px Georgia, serif';
        ctx.fillStyle = '#555555';
        ctx.fillText(displayTitle, centerX, 510);
    }

    // Training title — smaller, muted
    ctx.font = '28px Georgia, serif';
    ctx.fillStyle = '#777777';
    ctx.fillText(trainingTitle, centerX, 570);

    // Today's date
    const today = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    ctx.font = '24px Georgia, serif';
    ctx.fillStyle = '#555555';
    // Position date near the bottom-left DATE label area
    ctx.textAlign = 'left';
    ctx.fillText(today, 120, 690);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
    // jsPDF px format: getWidth/getHeight returns px dimensions matching the canvas
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH);

    return pdf.output('blob');
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
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);

    const handleConfirm = async () => {
        if (selectedIds.length === 0 || isGenerating) return;

        setIsGenerating(true);
        try {
            const templateSrc = '/images/certificate-template.jpg';
            const zip = new JSZip();

            const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

            for (const student of selectedStudents) {
                const pdfBlob = await generateCertificatePdf(
                    student,
                    training.name ?? training.title ?? '',
                    templateSrc,
                );
                const safeName = student.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
                zip.file(`certificat-${safeName}.pdf`, pdfBlob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, 'certificats.zip');

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
            <DialogContent className="w-[95vw] max-w-3xl bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 p-0 overflow-hidden">

                {/* ── Header ── */}
                <div className="px-6 pt-6 pb-4 border-b border-alpha/10">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Award className="w-6 h-6 text-alpha flex-shrink-0" />
                        Imprimer Certificats
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Sélectionnez les étudiants qui ont complété{' '}
                        <span className="font-semibold text-dark dark:text-light">
                            {training.name ?? training.title}
                        </span>{' '}
                        pour générer leurs certificats.
                    </DialogDescription>

                    {/* Select-all bar */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-dark/60 dark:text-light/60">
                            <span className="text-alpha font-bold">{selectedIds.length}</span>
                            {' / '}
                            {students.length} sélectionné{selectedIds.length !== 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="text-sm font-semibold text-alpha hover:underline"
                        >
                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                    </div>
                </div>

                {/* ── Student grid ── */}
                <div className="px-6 py-4 overflow-y-auto max-h-[55vh]">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-dark/40 dark:text-light/40">
                            <Award className="w-12 h-12 opacity-30" />
                            <p className="text-sm">Aucun étudiant inscrit à cette formation.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                            {students.map((student) => {
                                const checked = selectedIds.includes(student.id);
                                const displayTitle = resolveTitle(
                                    student.field ?? student.specialite ?? student.domain ?? '',
                                );
                                return (
                                    <label
                                        key={student.id}
                                        htmlFor={`cert-student-${student.id}`}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-150 ${
                                            checked
                                                ? 'bg-alpha/10 border-alpha/40 shadow-sm'
                                                : 'bg-light dark:bg-dark border-alpha/10 hover:border-alpha/30 hover:bg-alpha/5'
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <Checkbox
                                            id={`cert-student-${student.id}`}
                                            checked={checked}
                                            onCheckedChange={() => toggleStudent(student.id)}
                                            className="data-[state=checked]:bg-alpha data-[state=checked]:border-alpha flex-shrink-0 w-5 h-5"
                                        />

                                        {/* Avatar */}
                                        <Avatar
                                            name={student.name}
                                            image={student.image ?? null}
                                            lastActivity={student.last_activity ?? null}
                                            className="w-12 h-12 flex-shrink-0 text-base"
                                            onlineCircleClass="w-3.5 h-3.5"
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm leading-tight truncate text-dark dark:text-light">
                                                {student.name}
                                            </p>
                                            {displayTitle && (
                                                <p className="text-xs mt-0.5 truncate text-dark/55 dark:text-light/55">
                                                    {displayTitle}
                                                </p>
                                            )}
                                            {student.email && (
                                                <p className="text-xs mt-0.5 truncate text-dark/40 dark:text-light/40">
                                                    {student.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Selected badge */}
                                        {checked && (
                                            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-alpha bg-alpha/10 px-2 py-0.5 rounded-full">
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
                <div className="px-6 py-4 border-t border-alpha/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <p className="text-xs text-dark/50 dark:text-light/50 hidden sm:block">
                        Un PDF par étudiant · téléchargé en .zip
                    </p>
                    <div className="flex gap-3 justify-end">
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
                            className="flex-1 sm:flex-none gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Génération…
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4" />
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
