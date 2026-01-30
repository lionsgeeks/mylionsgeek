import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    CheckCircle2,
    Edit,
    ExternalLink,
    File,
    FileText,
    FileVideo,
    ImageIcon,
    Link2,
    MessageCircle,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

export default function StudentExercises({ training, exercices }) {
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [selectedExercice, setSelectedExercice] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const [requestingReview, setRequestingReview] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        exercice_id: '',
        submission_link: '',
        notes: '',
    });

    const getFileIcon = (fileType) => {
        if (!fileType) return File;
        if (fileType === 'image') return ImageIcon;
        if (fileType === 'pdf') return FileText;
        if (fileType === 'video') return FileVideo;
        return File;
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        return `/storage/${filePath}`;
    };

    const openSubmissionModal = (exercice) => {
        setSelectedExercice(exercice);
        const existingSubmission = exercice.submissions?.[0];
        setData({
            exercice_id: exercice.id,
            submission_link: existingSubmission?.submission_link || '',
            notes: existingSubmission?.notes || '',
        });
        setSubmissionModalOpen(true);
    };

    const closeSubmissionModal = () => {
        setSubmissionModalOpen(false);
        setSelectedExercice(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/students/exercises/submit', {
            onSuccess: () => {
                closeSubmissionModal();
                router.reload();
            },
        });
    };

    const handleDelete = (submission) => {
        setSubmissionToDelete(submission);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (submissionToDelete) {
            router.delete(`/students/exercises/submissions/${submissionToDelete.id}`, {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setSubmissionToDelete(null);
                    router.reload();
                },
            });
        }
    };

    const handleRequestReview = (submission) => {
        setRequestingReview(true);
        router.post(
            `/students/exercises/submissions/${submission.id}/request-review`,
            {},
            {
                onSuccess: () => {
                    setRequestingReview(false);
                    router.reload();
                },
                onError: () => {
                    setRequestingReview(false);
                },
            },
        );
    };

    if (!training) {
        return (
            <AppLayout>
                <Head title="Exercises" />
                <div className="flex min-h-screen items-center justify-center p-6">
                    <div className="text-center">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h2 className="mb-2 text-2xl font-bold text-dark dark:text-light">No Training Assigned</h2>
                        <p className="text-dark/70 dark:text-light/70">You are not currently enrolled in any training program.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Exercises" />

            <div className="min-h-screen p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-dark dark:text-light">Training Exercises</h1>
                    <p className="text-dark/70 dark:text-light/70">
                        {training.name} - {training.category}
                    </p>
                </div>

                {/* Exercises List */}
                {exercices.length === 0 ? (
                    <div className="rounded-2xl border border-alpha/20 bg-light py-12 text-center dark:bg-dark">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-dark dark:text-light">No Exercises Available</h3>
                        <p className="text-dark/70 dark:text-light/70">Your coach hasn't assigned any exercises yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {exercices.map((exercice) => {
                            const FileIcon = getFileIcon(exercice.file_type);
                            const submission = exercice.submissions?.[0];
                            const hasSubmission = !!submission;

                            return (
                                <div
                                    key={exercice.id}
                                    className="rounded-2xl border border-alpha/20 bg-light p-6 transition-colors hover:border-alpha/40 dark:bg-dark"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h2 className="text-xl font-bold text-dark dark:text-light">{exercice.title}</h2>
                                                {hasSubmission && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                        <CheckCircle2 size={12} />
                                                        Submitted
                                                    </span>
                                                )}
                                            </div>
                                            {exercice.description && <p className="mb-4 text-dark/70 dark:text-light/70">{exercice.description}</p>}
                                        </div>
                                    </div>

                                    {/* Exercise File */}
                                    {exercice.file && (
                                        <div className="mb-4 rounded-lg border border-alpha/20 bg-gray-50 p-4 dark:bg-gray-900">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="text-[var(--color-alpha)]" size={20} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-dark dark:text-light">Exercise File</p>
                                                    <a
                                                        href={getFileUrl(exercice.file)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-sm text-[var(--color-alpha)] hover:underline"
                                                    >
                                                        View File
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Model Assignment */}
                                    {exercice.model && (
                                        <div className="mb-4 flex items-center gap-2 text-sm text-dark/60 dark:text-light/60">
                                            <span className="font-semibold">Model:</span>
                                            <span>{exercice.model.name}</span>
                                        </div>
                                    )}

                                    {/* Submission Section */}
                                    <div className="mt-6 border-t border-alpha/20 pt-6">
                                        {hasSubmission ? (
                                            <div className="space-y-3">
                                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-600/30 dark:bg-green-900/20">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <Link2 className="text-green-600 dark:text-green-400" size={16} />
                                                                <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                                                                    Your Submission
                                                                </span>
                                                            </div>
                                                            <a
                                                                href={submission.submission_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mb-2 flex items-center gap-1 text-sm text-green-700 hover:underline dark:text-green-300"
                                                            >
                                                                {submission.submission_link}
                                                                <ExternalLink size={12} />
                                                            </a>
                                                            {submission.notes && (
                                                                <p className="mt-2 text-sm text-green-700/80 dark:text-green-300/80">
                                                                    {submission.notes}
                                                                </p>
                                                            )}
                                                            <p className="mt-2 text-xs text-green-600/70 dark:text-green-400/70">
                                                                Submitted on{' '}
                                                                {new Date(submission.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {submission.review_requested ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled
                                                                    className="cursor-not-allowed border-green-600 bg-green-50 text-green-600 dark:bg-green-900/20"
                                                                >
                                                                    <CheckCircle size={14} className="mr-1" />
                                                                    Review Requested
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRequestReview(submission)}
                                                                    disabled={requestingReview}
                                                                    className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                                                >
                                                                    <MessageCircle size={14} className="mr-1" />
                                                                    {requestingReview ? 'Requesting...' : 'Ask for Review'}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openSubmissionModal(exercice)}
                                                                className="border-[var(--color-alpha)] text-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/10"
                                                            >
                                                                <Edit size={14} className="mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(submission)}
                                                                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => openSubmissionModal(exercice)}
                                                className="gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                            >
                                                <Plus size={16} />
                                                Submit Your Work
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Submission Modal */}
                <Dialog open={submissionModalOpen} onOpenChange={setSubmissionModalOpen}>
                    <DialogContent className="border border-alpha/20 bg-light text-dark sm:max-w-2xl dark:bg-dark dark:text-light">
                        <DialogHeader>
                            <DialogTitle>{selectedExercice?.submissions?.[0] ? 'Update Submission' : 'Submit Your Work'}</DialogTitle>
                            <DialogDescription>
                                {selectedExercice && (
                                    <>
                                        Submit your work for: <strong>{selectedExercice.title}</strong>
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="submission_link">Submission Link *</Label>
                                <Input
                                    id="submission_link"
                                    type="url"
                                    value={data.submission_link}
                                    onChange={(e) => setData('submission_link', e.target.value)}
                                    placeholder="https://example.com/your-work"
                                    required
                                />
                                <p className="mt-1 text-xs text-dark/60 dark:text-light/60">
                                    Paste the link to your completed exercise (GitHub, CodePen, Figma, etc.)
                                </p>
                                {errors.submission_link && <p className="mt-1 text-sm text-red-600">{errors.submission_link}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any additional notes about your submission..."
                                    rows={4}
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeSubmissionModal} className="cursor-pointer">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : selectedExercice?.submissions?.[0] ? 'Update Submission' : 'Submit'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent className="border border-alpha/20 bg-light text-dark sm:max-w-md dark:bg-dark dark:text-light">
                        <DialogHeader>
                            <DialogTitle>Delete Submission?</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this submission? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button onClick={confirmDelete} className="cursor-pointer bg-red-600 text-white hover:bg-red-700">
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
