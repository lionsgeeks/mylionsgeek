import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { FileText, ImageIcon, FileVideo, File, Link2, CheckCircle2, X, ExternalLink, Plus, Edit, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    post('/student/exercises/submit', {
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
      router.delete(`/student/exercises/submissions/${submissionToDelete.id}`, {
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
    router.post(`/student/exercises/submissions/${submission.id}/request-review`, {}, {
      onSuccess: () => {
        setRequestingReview(false);
        router.reload();
      },
      onError: () => {
        setRequestingReview(false);
      },
    });
  };

  if (!training) {
    return (
      <AppLayout>
        <Head title="Exercises" />
        <div className="p-6 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-2">No Training Assigned</h2>
            <p className="text-dark/70 dark:text-light/70">
              You are not currently enrolled in any training program.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Exercises" />

      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark dark:text-light mb-2">
            Training Exercises
          </h1>
          <p className="text-dark/70 dark:text-light/70">
            {training.name} - {training.category}
          </p>
        </div>

        {/* Exercises List */}
        {exercices.length === 0 ? (
          <div className="text-center py-12 bg-light dark:bg-dark rounded-2xl border border-alpha/20">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark dark:text-light mb-2">
              No Exercises Available
            </h3>
            <p className="text-dark/70 dark:text-light/70">
              Your coach hasn't assigned any exercises yet.
            </p>
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
                  className="bg-light dark:bg-dark rounded-2xl border border-alpha/20 p-6 hover:border-alpha/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-dark dark:text-light">
                          {exercice.title}
                        </h2>
                        {hasSubmission && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                            <CheckCircle2 size={12} />
                            Submitted
                          </span>
                        )}
                      </div>
                      {exercice.description && (
                        <p className="text-dark/70 dark:text-light/70 mb-4">
                          {exercice.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Exercise File */}
                  {exercice.file && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-alpha/20">
                      <div className="flex items-center gap-3">
                        <FileIcon className="text-[var(--color-alpha)]" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark dark:text-light">
                            Exercise File
                          </p>
                          <a
                            href={getFileUrl(exercice.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--color-alpha)] hover:underline flex items-center gap-1 mt-1"
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
                  <div className="mt-6 pt-6 border-t border-alpha/20">
                    {hasSubmission ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-600/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Link2 className="text-green-600 dark:text-green-400" size={16} />
                                <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                                  Your Submission
                                </span>
                              </div>
                              <a
                                href={submission.submission_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center gap-1 mb-2"
                              >
                                {submission.submission_link}
                                <ExternalLink size={12} />
                              </a>
                              {submission.notes && (
                                <p className="text-sm text-green-700/80 dark:text-green-300/80 mt-2">
                                  {submission.notes}
                                </p>
                              )}
                              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                                Submitted on {new Date(submission.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestReview(submission)}
                                disabled={requestingReview}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                              >
                                <MessageCircle size={14} className="mr-1" />
                                {requestingReview ? 'Requesting...' : 'Ask for Review'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSubmissionModal(exercice)}
                                className="text-[var(--color-alpha)] border-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/10"
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(submission)}
                                className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
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
                        className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]"
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
          <DialogContent className="sm:max-w-2xl bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
            <DialogHeader>
              <DialogTitle>
                {selectedExercice?.submissions?.[0] ? 'Update Submission' : 'Submit Your Work'}
              </DialogTitle>
              <DialogDescription>
                {selectedExercice && (
                  <>
                    Submit your work for: <strong>{selectedExercice.title}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <p className="text-xs text-dark/60 dark:text-light/60 mt-1">
                  Paste the link to your completed exercise (GitHub, CodePen, Figma, etc.)
                </p>
                {errors.submission_link && (
                  <p className="text-red-600 text-sm mt-1">{errors.submission_link}</p>
                )}
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
                {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeSubmissionModal}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
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
          <DialogContent className="sm:max-w-md bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
            <DialogHeader>
              <DialogTitle>Delete Submission?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this submission? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

