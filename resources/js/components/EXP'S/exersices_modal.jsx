import { useState, useEffect } from 'react';
import { PlusCircle, FileText, ImageIcon, FileVideo, File, X, Eye, Trash2, Calendar, Tag, Download, Users, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, router } from '@inertiajs/react';

export default function ExercicesModal({ trainingId, models = [] }) {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExercice, setSelectedExercice] = useState(null);
  const [exercices, setExercices] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    title: '',
    description: '',
    file: null,
    training_id: trainingId,
    model_id: '',
  });

  // Fetch exercices when list modal opens
  useEffect(() => {
    if (listOpen && trainingId) {
      fetchExercices();
    }
  }, [listOpen, trainingId]);

  const fetchExercices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/exercices?training_id=${trainingId}`);
      const data = await response.json();
      setExercices(data);
    } catch (error) {
      console.error('Failed to fetch exercices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      reset();
      setFilePreview(null);
    }
    setOpen(newOpen);
  };

  const handleFileChange = (file) => {
    if (file) {
      setData('file', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          url: reader.result,
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setData('file', null);
    setFilePreview(null);
  };

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

  function handleSubmit(e) {
    e.preventDefault();

    post('/admin/exercices', {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setFilePreview(null);
        setOpen(false);
        if (listOpen) {
          fetchExercices();
        }
      },
      onError: (errors) => {
        console.error('Form errors:', errors);
      }
    });
  }

  const handleDelete = async (exerciceId) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      const response = await fetch(`/admin/exercices/${exerciceId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        fetchExercices();
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  return (
    <>
      {/* List Modal */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] flex-1 sm:flex-none">
            <FileText size={16} />
            <span>Exercises</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exercises</DialogTitle>
            <DialogDescription>
              View and manage exercises for this training
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setListOpen(false);
                setOpen(true);
              }}
              className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]"
            >
              <PlusCircle size={16} />
              Add Exercise
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-dark/70 dark:text-light/70">Loading...</div>
          ) : exercices.length === 0 ? (
            <div className="py-8 text-center text-dark/70 dark:text-light/70">
              No exercises yet. Click "Add Exercise" to create one.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {exercices.map((exercice) => {
                const FileIcon = getFileIcon(exercice.file_type);
                return (
                  <div
                    key={exercice.id}
                    className="p-4 border border-alpha/20 rounded-lg hover:border-alpha/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedExercice(exercice);
                      setDetailOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-dark dark:text-light mb-1">
                          {exercice.title}
                        </h3>
                        {exercice.description && (
                          <p className="text-sm text-dark/70 dark:text-light/70 mb-3 line-clamp-2">
                            {exercice.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {exercice.model && (
                            <div className="flex items-center gap-2 text-sm text-dark/60 dark:text-light/60">
                              <Tag size={14} className="text-[var(--color-alpha)]" />
                              <span className="font-semibold">Model:</span>
                              <span>{exercice.model.name}</span>
                            </div>
                          )}
                          {exercice.file && (
                            <div className="flex items-center gap-2">
                              <FileIcon size={16} className="text-[var(--color-alpha)]" />
                              <span className="text-sm text-dark/60 dark:text-light/60">
                                File attached
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExercice(exercice);
                            setDetailOpen(true);
                          }}
                          className="text-[var(--color-alpha)] border-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/10"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(exercice.id);
                          }}
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Exercise Modal */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
            <DialogDescription>
              Fill the form below to create a new exercise for this training.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Enter exercise title"
                required
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Enter exercise description (optional)"
                rows={4}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="model_id">Assign to Model</Label>
              <Select
                value={data.model_id?.toString() || undefined}
                onValueChange={(value) => setData('model_id', value === 'none' ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model_id && <p className="text-red-600 text-sm mt-1">{errors.model_id}</p>}
            </div>

            <div>
              <Label htmlFor="file">File (Image, PDF, or Video)</Label>
              <div className="mt-2">
                {filePreview ? (
                  <div className="relative inline-block">
                    {filePreview.type.startsWith('image/') ? (
                      <img
                        src={filePreview.url}
                        alt={filePreview.name}
                        className="h-32 w-auto rounded-lg border-2 border-yellow-200 dark:border-yellow-600/30"
                      />
                    ) : (
                      <div className="h-32 w-48 rounded-lg border-2 border-yellow-200 dark:border-yellow-600/30 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20">
                        <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        <span className="ml-2 text-sm">{filePreview.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-yellow-200 dark:border-yellow-600/30 rounded-lg cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 mb-2 text-yellow-600 dark:text-yellow-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> file
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Image, PDF, or Video (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf,video/*"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
              {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer"
                disabled={processing}
              >
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exercise Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Exercise Details</DialogTitle>
            <DialogDescription>
              View complete information about this exercise
            </DialogDescription>
          </DialogHeader>

          {selectedExercice && (
            <div className="mt-4 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-dark dark:text-light mb-2">
                  {selectedExercice.title}
                </h2>
              </div>

              {/* Description */}
              {selectedExercice.description && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-600/30">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Description
                  </h3>
                  <p className="text-dark dark:text-light whitespace-pre-wrap">
                    {selectedExercice.description}
                  </p>
                </div>
              )}

              {/* Model Assignment */}
              {selectedExercice.model && (
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#1f1f1f] rounded-lg border border-alpha/20">
                  <div className="p-2 bg-[var(--color-alpha)]/10 rounded-lg">
                    <Tag className="text-[var(--color-alpha)]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-dark/70 dark:text-light/70">Assigned Model</p>
                    <p className="font-semibold text-dark dark:text-light">{selectedExercice.model.name}</p>
                  </div>
                </div>
              )}

              {/* File Preview */}
              {selectedExercice.file && (
                <div>
                  <h3 className="text-sm font-semibold text-dark dark:text-light mb-3">
                    Attached File
                  </h3>
                  <div className="border border-alpha/20 rounded-lg overflow-hidden">
                    {selectedExercice.file_type === 'image' ? (
                      <div className="relative">
                        <img
                          src={getFileUrl(selectedExercice.file)}
                          alt={selectedExercice.title}
                          className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
                        />
               
                      </div>
                    ) : selectedExercice.file_type === 'video' ? (
                      <div className="relative bg-black">
                        <video
                          src={getFileUrl(selectedExercice.file)}
                          controls
                          className="w-full max-h-96"
                        />
                        <div className="absolute top-2 right-2">
                          <a
                            href={getFileUrl(selectedExercice.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Download size={18} className="text-[var(--color-alpha)]" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                        <FileText className="w-16 h-16 text-[var(--color-alpha)] mb-4" />
                        <p className="text-dark dark:text-light font-semibold mb-2">
                          {selectedExercice.file.split('/').pop()}
                        </p>
                        <a
                          href={getFileUrl(selectedExercice.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-alpha)] text-black rounded-lg hover:bg-[var(--color-alpha)]/90 transition-colors"
                        >
                          <Download size={16} />
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submissions */}
              {selectedExercice.submissions && selectedExercice.submissions.length > 0 && (
                <div className="pt-4 border-t border-alpha/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-[var(--color-alpha)]" size={20} />
                    <h3 className="text-lg font-semibold text-dark dark:text-light">
                      Student Submissions ({selectedExercice.submissions.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedExercice.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="p-4 bg-white dark:bg-[#1f1f1f] rounded-lg border border-alpha/20 hover:border-[var(--color-alpha)]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-[var(--color-alpha)] text-black flex items-center justify-center font-bold text-sm">
                                {submission.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-dark dark:text-light">
                                  {submission.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-dark/60 dark:text-light/60">
                                  {submission.user?.email || ''}
                                </p>
                              </div>
                            </div>
                            <a
                              href={submission.submission_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-[var(--color-alpha)] hover:underline mt-2"
                            >
                              <ExternalLink size={14} />
                              {submission.submission_link}
                            </a>
                            {submission.notes && (
                              <p className="text-sm text-dark/70 dark:text-light/70 mt-2 italic">
                                "{submission.notes}"
                              </p>
                            )}
                            <p className="text-xs text-dark/50 dark:text-light/50 mt-2">
                              Submitted on {new Date(submission.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-alpha/20">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[var(--color-alpha)]" size={18} />
                  <div>
                    <p className="text-xs text-dark/70 dark:text-light/70">Created</p>
                    <p className="text-sm font-semibold text-dark dark:text-light">
                      {new Date(selectedExercice.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {selectedExercice.file_type && (
                  <div className="flex items-center gap-3">
                    {(() => {
                      const FileTypeIcon = getFileIcon(selectedExercice.file_type);
                      return <FileTypeIcon className="text-[var(--color-alpha)]" size={18} />;
                    })()}
                    <div>
                      <p className="text-xs text-dark/70 dark:text-light/70">File Type</p>
                      <p className="text-sm font-semibold text-dark dark:text-light capitalize">
                        {selectedExercice.file_type}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-alpha/20">
                <Button
                  variant="outline"
                  onClick={() => setDetailOpen(false)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this exercise?')) {
                      handleDelete(selectedExercice.id);
                      setDetailOpen(false);
                    }
                  }}
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

