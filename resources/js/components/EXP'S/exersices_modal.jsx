import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import {
    Calendar,
    Download,
    Edit,
    ExternalLink,
    Eye,
    File,
    FileText,
    FileVideo,
    ImageIcon,
    PlusCircle,
    Star,
    Tag,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ExercicesModal({ trainingId, courses = [] }) {
    const [open, setOpen] = useState(false);
    const [listOpen, setListOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedExercice, setSelectedExercice] = useState(null);
    const [exercices, setExercices] = useState([]);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        file: null,
        training_id: trainingId,
        course_id: '',
        xp: 0,
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
            },
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

    const openRatingModal = (submission) => {
        setSelectedSubmission(submission);
        setRatingValue(submission.rating || 0);
        setRatingComment(submission.rating_comment || '');
        setRatingModalOpen(true);
    };

    const handleRateSubmission = async () => {
        if (!selectedSubmission || ratingValue === 0) return;

        setRatingLoading(true);
        try {
            const response = await fetch(`/admin/exercices/submissions/${selectedSubmission.id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    rating: ratingValue,
                    rating_comment: ratingComment,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update the submission in the exercices list
                setExercices((prev) =>
                    prev.map((ex) => ({
                        ...ex,
                        submissions: ex.submissions?.map((sub) => (sub.id === selectedSubmission.id ? data.submission : sub)) || [],
                    })),
                );
                // Update selected exercice if it's the same one
                if (selectedExercice && selectedExercice.id === data.submission.exercice_id) {
                    setSelectedExercice((prev) => ({
                        ...prev,
                        submissions: prev.submissions?.map((sub) => (sub.id === selectedSubmission.id ? data.submission : sub)) || [],
                    }));
                }
                setRatingModalOpen(false);
                setSelectedSubmission(null);
                setRatingValue(0);
                setRatingComment('');
            }
        } catch (error) {
            console.error('Failed to rate submission:', error);
        } finally {
            setRatingLoading(false);
        }
    };

    return (
        <>
            {/* List Modal */}
            <Dialog open={listOpen} onOpenChange={setListOpen}>
                <DialogTrigger asChild>
                    <Button className="flex-1 gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] sm:flex-none">
                        <FileText size={16} />
                        <span>Exercises</span>
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-y-auto border border-alpha/20 bg-light text-dark sm:max-w-4xl dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle>Exercises</DialogTitle>
                        <DialogDescription>View and manage exercises for this training</DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={() => {
                                setListOpen(false);
                                setOpen(true);
                            }}
                            className="gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                        >
                            <PlusCircle size={16} />
                            Add Exercise
                        </Button>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-dark/70 dark:text-light/70">Loading...</div>
                    ) : exercices.length === 0 ? (
                        <div className="py-8 text-center text-dark/70 dark:text-light/70">No exercises yet. Click "Add Exercise" to create one.</div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {exercices.map((exercice) => {
                                const FileIcon = getFileIcon(exercice.file_type);
                                return (
                                    <div
                                        key={exercice.id}
                                        className="cursor-pointer rounded-lg border border-alpha/20 p-4 transition-colors hover:border-alpha/40"
                                        onClick={() => {
                                            setSelectedExercice(exercice);
                                            setDetailOpen(true);
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="mb-1 text-lg font-bold text-dark dark:text-light">{exercice.title}</h3>
                                                {exercice.description && (
                                                    <p className="mb-3 line-clamp-2 text-sm text-dark/70 dark:text-light/70">
                                                        {exercice.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4">
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
                                                            <span className="text-sm text-dark/60 dark:text-light/60">File attached</span>
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
                                                    className="border-[var(--color-alpha)] text-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/10"
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
                                                    className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
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
                <DialogContent className="max-h-[90vh] overflow-y-auto border border-alpha/20 bg-light text-dark sm:max-w-2xl dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle>Add New Exercise</DialogTitle>
                        <DialogDescription>Fill the form below to create a new exercise for this training.</DialogDescription>
                    </DialogHeader>

                    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter exercise title"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <Label htmlFor="course_id">Assign to Course</Label>
                            <Select
                                value={data.course_id?.toString() || undefined}
                                onValueChange={(value) => setData('course_id', value === 'none' ? null : parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="xp">Experience Points (XP)</Label>
                            <Input
                                id="xp"
                                type="number"
                                min="0"
                                value={data.xp}
                                onChange={(e) => setData('xp', parseInt(e.target.value) || 0)}
                                placeholder="Enter XP amount (e.g., 100, 500)"
                            />
                            <p className="mt-1 text-xs text-dark/60 dark:text-light/60">
                                XP awarded to students based on their submission rating. 100% rating = full XP, lower ratings = proportional XP.
                            </p>
                            {errors.xp && <p className="mt-1 text-sm text-red-600">{errors.xp}</p>}
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
                                            <div className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-600/30 dark:bg-yellow-900/20">
                                                <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                                <span className="ml-2 text-sm">{filePreview.name}</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-200 transition-colors hover:bg-yellow-50 dark:border-yellow-600/30 dark:hover:bg-yellow-900/20">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileText className="mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> file
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Image, PDF, or Video (MAX. 10MB)</p>
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
                            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer bg-yellow-600 hover:bg-yellow-700" disabled={processing}>
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Exercise Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto border border-alpha/20 bg-light text-dark sm:max-w-3xl dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Exercise Details</DialogTitle>
                        <DialogDescription>View complete information about this exercise</DialogDescription>
                    </DialogHeader>

                    {selectedExercice && (
                        <div className="mt-4 space-y-6">
                            {/* Title */}
                            <div>
                                <h2 className="mb-2 text-2xl font-bold text-dark dark:text-light">{selectedExercice.title}</h2>
                            </div>

                            {/* Description */}
                            {selectedExercice.description && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-600/30 dark:bg-yellow-900/20">
                                    <h3 className="mb-2 text-sm font-semibold text-yellow-800 dark:text-yellow-300">Description</h3>
                                    <p className="whitespace-pre-wrap text-dark dark:text-light">{selectedExercice.description}</p>
                                </div>
                            )}

                            {/* Model Assignment */}
                            {selectedExercice.model && (
                                <div className="flex items-center gap-3 rounded-lg border border-alpha/20 bg-white p-4 dark:bg-[#1f1f1f]">
                                    <div className="rounded-lg bg-[var(--color-alpha)]/10 p-2">
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
                                    <h3 className="mb-3 text-sm font-semibold text-dark dark:text-light">Attached File</h3>
                                    <div className="overflow-hidden rounded-lg border border-alpha/20">
                                        {selectedExercice.file_type === 'image' ? (
                                            <div className="relative">
                                                <img
                                                    src={getFileUrl(selectedExercice.file)}
                                                    alt={selectedExercice.title}
                                                    className="h-auto max-h-96 w-full bg-gray-50 object-contain dark:bg-gray-900"
                                                />
                                            </div>
                                        ) : selectedExercice.file_type === 'video' ? (
                                            <div className="relative bg-black">
                                                <video src={getFileUrl(selectedExercice.file)} controls className="max-h-96 w-full" />
                                                <div className="absolute top-2 right-2">
                                                    <a
                                                        href={getFileUrl(selectedExercice.file)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                                    >
                                                        <Download size={18} className="text-[var(--color-alpha)]" />
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
                                                <FileText className="mb-4 h-16 w-16 text-[var(--color-alpha)]" />
                                                <p className="mb-2 font-semibold text-dark dark:text-light">
                                                    {selectedExercice.file.split('/').pop()}
                                                </p>
                                                <a
                                                    href={getFileUrl(selectedExercice.file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-alpha)] px-4 py-2 text-black transition-colors hover:bg-[var(--color-alpha)]/90"
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
                                <div className="border-t border-alpha/20 pt-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Users className="text-[var(--color-alpha)]" size={20} />
                                        <h3 className="text-lg font-semibold text-dark dark:text-light">
                                            Student Submissions ({selectedExercice.submissions.length})
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedExercice.submissions.map((submission) => (
                                            <div
                                                key={submission.id}
                                                className="rounded-lg border border-alpha/20 bg-white p-4 transition-colors hover:border-[var(--color-alpha)]/40 dark:bg-[#1f1f1f]"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-alpha)] text-sm font-bold text-black">
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
                                                            className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--color-alpha)] hover:underline"
                                                        >
                                                            <ExternalLink size={14} />
                                                            {submission.submission_link}
                                                        </a>
                                                        {submission.notes && (
                                                            <p className="mt-2 text-sm text-dark/70 italic dark:text-light/70">
                                                                "{submission.notes}"
                                                            </p>
                                                        )}

                                                        {/* Rating Display */}
                                                        {submission.rating !== null && submission.rating !== undefined ? (
                                                            <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-600/30 dark:bg-yellow-900/20">
                                                                <div className="mb-1 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                                                                            {submission.rating}%
                                                                        </span>
                                                                        <span className="text-sm text-yellow-600 dark:text-yellow-400">Rating</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openRatingModal(submission)}
                                                                        className="border-yellow-300 text-xs text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                                                                    >
                                                                        <Edit size={12} className="mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                </div>
                                                                {submission.rating_comment && (
                                                                    <p className="mt-1 text-sm text-yellow-700/80 dark:text-yellow-300/80">
                                                                        {submission.rating_comment}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openRatingModal(submission)}
                                                                className="mt-3 border-[var(--color-alpha)] text-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/10"
                                                            >
                                                                <Star size={14} className="mr-1" />
                                                                Rate Submission
                                                            </Button>
                                                        )}

                                                        <p className="mt-2 text-xs text-dark/50 dark:text-light/50">
                                                            Submitted on{' '}
                                                            {new Date(submission.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
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
                            <div className="grid grid-cols-1 gap-4 border-t border-alpha/20 pt-4 md:grid-cols-3">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-[var(--color-alpha)]" size={18} />
                                    <div>
                                        <p className="text-xs text-dark/70 dark:text-light/70">Created</p>
                                        <p className="text-sm font-semibold text-dark dark:text-light">
                                            {new Date(selectedExercice.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
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
                                            <p className="text-sm font-semibold text-dark capitalize dark:text-light">{selectedExercice.file_type}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedExercice.xp !== undefined && selectedExercice.xp !== null && selectedExercice.xp > 0 && (
                                    <div className="flex items-center gap-3">
                                        <Star className="fill-[var(--color-alpha)] text-[var(--color-alpha)]" size={18} />
                                        <div>
                                            <p className="text-xs text-dark/70 dark:text-light/70">Experience Points</p>
                                            <p className="text-sm font-semibold text-dark dark:text-light">{selectedExercice.xp} XP</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t border-alpha/20 pt-4">
                                <Button variant="outline" onClick={() => setDetailOpen(false)} className="cursor-pointer">
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
                                    className="cursor-pointer border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rating Modal */}
            <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
                <DialogContent className="border border-alpha/20 bg-light text-dark sm:max-w-md dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle>Rate Submission</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission && (
                                <>
                                    Rate the submission by <strong>{selectedSubmission.user?.name || 'Student'}</strong>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="rating">Rating (0-100)</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Input
                                        id="rating"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={ratingValue}
                                        onChange={(e) => setRatingValue(parseFloat(e.target.value) || 0)}
                                        placeholder="Enter rating (0-100)"
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-semibold whitespace-nowrap text-dark dark:text-light">
                                        {ratingValue > 0 ? `${ratingValue}%` : '0%'}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-dark/60 dark:text-light/60">Enter a rating from 0 to 100 (percentage)</p>
                            </div>

                            <div>
                                <Label htmlFor="rating_comment">Comment (Optional)</Label>
                                <Textarea
                                    id="rating_comment"
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    placeholder="Add feedback or comments about this submission..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setRatingModalOpen(false);
                                        setSelectedSubmission(null);
                                        setRatingValue(0);
                                        setRatingComment('');
                                    }}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRateSubmission}
                                    disabled={ratingValue === 0 || ratingValue < 0 || ratingValue > 100 || ratingLoading}
                                    className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] disabled:opacity-50"
                                >
                                    {ratingLoading ? 'Saving...' : 'Save Rating'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
