import Rolegard from '@/components/rolegard';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Clock, Edit, ExternalLink, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ProjectShow({ project }) {
    const { auth } = usePage().props;
    const isOwner = project.user_id === auth.user.id;
    const isAdmin = ['admin', 'super_admin', 'moderateur', 'coach'].includes(auth.user.role);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [reviewRatings, setReviewRatings] = useState({
        good_structure: false,
        clean_code: false,
        pure_code: false,
        pure_ai: false,
        mix_vibe: false,
        responsive_design: false,
        good_performance: false,
    });
    const [reviewNotes, setReviewNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-50">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rejected
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-50">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
        }
    };

    const handleApprove = () => {
        setShowApproveModal(true);
    };

    const confirmApprove = () => {
        setIsProcessing(true);
        router.post(
            `/admin/projects/${project.id}/approve`,
            {
                review_ratings: reviewRatings,
                review_notes: reviewNotes.trim(),
            },
            {
                onSuccess: () => {
                    setShowApproveModal(false);
                    setReviewRatings({
                        good_structure: false,
                        clean_code: false,
                        pure_code: false,
                        pure_ai: false,
                        mix_vibe: false,
                        responsive_design: false,
                        good_performance: false,
                    });
                    setReviewNotes('');
                    router.reload();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            return;
        }
        setIsProcessing(true);
        router.post(
            `/admin/projects/${project.id}/reject`,
            {
                rejection_reason: rejectionReason.trim(),
            },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    router.reload();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={project.title || 'Project Details'} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.visit(`/students/project/${project.id}`)} className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{project.title || 'Untitled Project'}</h1>
                            <div className="mt-2 flex items-center gap-3">
                                {getStatusBadge(project.status)}
                                <span className="text-sm text-neutral-500">Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <Rolegard authorized={['admin', 'super_admin', 'moderateur', 'coach']}>
                        <div className="flex gap-2">
                            {project.status === 'pending' && (
                                <>
                                    <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 text-white hover:bg-green-700">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        {isProcessing ? 'Approving...' : 'Approve'}
                                    </Button>
                                    <Button onClick={handleReject} disabled={isProcessing} variant="destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </Rolegard>

                    {/* Owner Actions */}
                    {isOwner && (project.status === 'pending' || project.status === 'rejected') && (
                        <Button
                            onClick={() => router.visit(`/students/projects?edit=${project.id}`)}
                            className="bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                        </Button>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Project Image */}
                        {project.image && (
                            <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <img src={`/storage/${project.image}`} alt={project.title} className="h-auto w-full object-cover" />
                            </div>
                        )}

                        {/* Description */}
                        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="mb-4 text-xl font-semibold">Description</h2>
                            <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Review Ratings (if reviewed) */}
                        {(project.review_ratings || project.review_notes) && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-xl font-semibold">Review Details</h2>

                                {project.review_ratings && Object.keys(project.review_ratings).length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Ratings</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.review_ratings.good_structure && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                                                >
                                                    Good Structure
                                                </Badge>
                                            )}
                                            {project.review_ratings.clean_code && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                                >
                                                    Clean Code
                                                </Badge>
                                            )}
                                            {project.review_ratings.pure_code && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                                >
                                                    Pure Code
                                                </Badge>
                                            )}
                                            {project.review_ratings.pure_ai && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                                >
                                                    Pure AI
                                                </Badge>
                                            )}
                                            {project.review_ratings.mix_vibe && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-900/20 dark:text-pink-300"
                                                >
                                                    Mix Vibe One
                                                </Badge>
                                            )}
                                            {project.review_ratings.responsive_design && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300"
                                                >
                                                    Responsive Design
                                                </Badge>
                                            )}
                                            {project.review_ratings.good_performance && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
                                                >
                                                    Good Performance
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {project.review_notes && (
                                    <div>
                                        <h3 className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Review Notes</h3>
                                        <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{project.review_notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rejection Reason (if rejected) */}
                        {project.status === 'rejected' && project.rejection_reason && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                                <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">Rejection Reason</h3>
                                <p className="text-red-700 dark:text-red-400">{project.rejection_reason}</p>
                            </div>
                        )}

                        {/* Project Link */}
                        {project.project && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-xl font-semibold">Project Link</h2>
                                <a
                                    href={project.project}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 font-medium text-[var(--color-alpha)] hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    {project.project}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Project Info Card */}
                        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-4 text-lg font-semibold">Project Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                                    <div>{getStatusBadge(project.status)}</div>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Created</p>
                                    <p className="text-sm font-medium">{format(new Date(project.created_at), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                                {project.updated_at && (
                                    <div>
                                        <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Last Updated</p>
                                        <p className="text-sm font-medium">{format(new Date(project.updated_at), 'MMM d, yyyy HH:mm')}</p>
                                    </div>
                                )}
                                {project.approved_at && (
                                    <div>
                                        <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Approved</p>
                                        <p className="text-sm font-medium">{format(new Date(project.approved_at), 'MMM d, yyyy HH:mm')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Card */}
                        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-4 text-lg font-semibold">Owner</h3>
                            {project.user && (
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        className="h-10 w-10"
                                        image={project.user.image ? `/storage/${project.user.image}` : null}
                                        name={project.user.name}
                                    />
                                    <div>
                                        <p className="font-medium">{project.user.name}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Project Creator</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Only - Approved By Card */}
                        <Rolegard authorized={['admin', 'super_admin', 'moderateur', 'coach']}>
                            {project.approved_by && (
                                <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                                    <h3 className="mb-4 text-lg font-semibold">Approved By</h3>
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            className="h-10 w-10"
                                            image={project.approved_by.image ? `/storage/${project.approved_by.image}` : null}
                                            name={project.approved_by.name}
                                        />
                                        <div>
                                            <p className="font-medium">{project.approved_by.name}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Moderator</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Rolegard>
                    </div>
                </div>
            </div>

            {/* Approval Modal with Ratings */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-h-[90vh] overflow-y-auto bg-light sm:max-w-[600px] dark:bg-dark">
                    <DialogHeader>
                        <DialogTitle>Review & Approve Project</DialogTitle>
                        <DialogDescription>Please rate the project and add any notes before approving.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Rating Checkboxes */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Project Ratings</Label>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="good_structure"
                                        checked={reviewRatings.good_structure}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, good_structure: checked }))}
                                    />
                                    <Label htmlFor="good_structure" className="cursor-pointer font-normal">
                                        Good Structure
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="clean_code"
                                        checked={reviewRatings.clean_code}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, clean_code: checked }))}
                                    />
                                    <Label htmlFor="clean_code" className="cursor-pointer font-normal">
                                        Clean Code
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pure_code"
                                        checked={reviewRatings.pure_code}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, pure_code: checked }))}
                                    />
                                    <Label htmlFor="pure_code" className="cursor-pointer font-normal">
                                        Pure Code
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pure_ai"
                                        checked={reviewRatings.pure_ai}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, pure_ai: checked }))}
                                    />
                                    <Label htmlFor="pure_ai" className="cursor-pointer font-normal">
                                        Pure AI
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mix_vibe"
                                        checked={reviewRatings.mix_vibe}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, mix_vibe: checked }))}
                                    />
                                    <Label htmlFor="mix_vibe" className="cursor-pointer font-normal">
                                        Mix Vibe One
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="responsive_design"
                                        checked={reviewRatings.responsive_design}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, responsive_design: checked }))}
                                    />
                                    <Label htmlFor="responsive_design" className="cursor-pointer font-normal">
                                        Responsive Design
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="good_performance"
                                        checked={reviewRatings.good_performance}
                                        onCheckedChange={(checked) => setReviewRatings((prev) => ({ ...prev, good_performance: checked }))}
                                    />
                                    <Label htmlFor="good_performance" className="cursor-pointer font-normal">
                                        Good Performance
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="review-notes">Review Notes</Label>
                            <Textarea
                                id="review-notes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add any additional notes about the project..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowApproveModal(false);
                                setReviewRatings({
                                    good_structure: false,
                                    clean_code: false,
                                    pure_code: false,
                                    pure_ai: false,
                                    mix_vibe: false,
                                    responsive_design: false,
                                    good_performance: false,
                                });
                                setReviewNotes('');
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmApprove} disabled={isProcessing} className="bg-green-600 text-white hover:bg-green-700">
                            {isProcessing ? 'Approving...' : 'Approve Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="bg-light sm:max-w-[500px] dark:bg-dark">
                    <DialogHeader>
                        <DialogTitle>Reject Project</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this project. This will be visible to the student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                            <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter the reason for rejection..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectionReason('');
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim() || isProcessing}>
                            {isProcessing ? 'Rejecting...' : 'Reject Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
