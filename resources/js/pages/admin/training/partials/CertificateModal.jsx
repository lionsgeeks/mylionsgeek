import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
            <DialogContent className="max-w-lg bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Award className="w-5 h-5 text-alpha" />
                        Imprimer Certificats
                    </DialogTitle>
                    <DialogDescription className="text-dark/60 dark:text-light/60">
                        Sélectionnez les étudiants qui ont complété la formation pour générer leurs
                        certificats.
                    </DialogDescription>
                </DialogHeader>

                {/* Select All toggle */}
                <div className="flex items-center justify-between py-2 border-b border-alpha/10">
                    <span className="text-sm font-semibold text-dark/70 dark:text-light/70">
                        {selectedIds.length} / {students.length} sélectionné
                        {selectedIds.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-sm font-medium text-alpha hover:underline"
                    >
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                </div>

                {/* Student list */}
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                    {students.length === 0 ? (
                        <p className="text-center py-8 text-dark/50 dark:text-light/50 text-sm">
                            Aucun étudiant inscrit à cette formation.
                        </p>
                    ) : (
                        students.map((student) => {
                            const checked = selectedIds.includes(student.id);
                            const displayTitle = resolveTitle(
                                student.field ?? student.specialite ?? student.domain ?? '',
                            );
                            return (
                                <label
                                    key={student.id}
                                    htmlFor={`cert-student-${student.id}`}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                                        checked
                                            ? 'bg-alpha/10 border border-alpha/30'
                                            : 'hover:bg-alpha/5 border border-transparent'
                                    }`}
                                >
                                    <Checkbox
                                        id={`cert-student-${student.id}`}
                                        checked={checked}
                                        onCheckedChange={() => toggleStudent(student.id)}
                                        className="data-[state=checked]:bg-alpha data-[state=checked]:border-alpha"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate text-dark dark:text-light">
                                            {student.name}
                                        </p>
                                        {displayTitle && (
                                            <p className="text-xs text-dark/55 dark:text-light/55 truncate">
                                                {displayTitle}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-alpha/20 text-dark dark:text-light flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0 || isGenerating}
                        className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
