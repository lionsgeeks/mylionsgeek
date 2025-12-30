import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import Rolegard from '@/components/rolegard';
import { format } from 'date-fns';

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
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-50">
                        <Clock className="w-3 h-3 mr-1" />
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
        router.post(`/admin/projects/${project.id}/approve`, {
            review_ratings: reviewRatings,
            review_notes: reviewNotes.trim(),
        }, {
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
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            return;
        }
        setIsProcessing(true);
        router.post(`/admin/projects/${project.id}/reject`, {
            rejection_reason: rejectionReason.trim(),
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectionReason('');
                router.reload();
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    return (
        <AppLayout>
            <Head title={project.title || 'Project Details'} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>   router.visit(`/student/project/${project.id}`)}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{project.title || 'Untitled Project'}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                {getStatusBadge(project.status)}
                                <span className="text-sm text-neutral-500">
                                    Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <Rolegard authorized={['admin', 'super_admin', 'moderateur', 'coach']}>
                        <div className="flex gap-2">
                            {project.status === 'pending' && (
                                <>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {isProcessing ? 'Approving...' : 'Approve'}
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        variant="destructive"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </Rolegard>

                    {/* Owner Actions */}
                    {(isOwner && (project.status === 'pending' || project.status === 'rejected')) && (
                        <Button
                            onClick={() => router.visit(`/student/projects?edit=${project.id}`)}
                            className="bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Project
                        </Button>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Image */}
                        {project.image && (
                            <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                <img
                                    src={`/storage/${project.image}`}
                                    alt={project.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Review Ratings (if reviewed) */}
                        {(project.review_ratings || project.review_notes) && (
                            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                                <h2 className="text-xl font-semibold mb-4">Review Details</h2>

                                {project.review_ratings && Object.keys(project.review_ratings).length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Ratings</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.review_ratings.good_structure && (
                                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                                    Good Structure
                                                </Badge>
                                            )}
                                            {project.review_ratings.clean_code && (
                                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                    Clean Code
                                                </Badge>
                                            )}
                                            {project.review_ratings.pure_code && (
                                                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                                    Pure Code
                                                </Badge>
                                            )}
                                            {project.review_ratings.pure_ai && (
                                                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                                                    Pure AI
                                                </Badge>
                                            )}
                                            {project.review_ratings.mix_vibe && (
                                                <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800">
                                                    Mix Vibe One
                                                </Badge>
                                            )}
                                            {project.review_ratings.responsive_design && (
                                                <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                                                    Responsive Design
                                                </Badge>
                                            )}
                                            {project.review_ratings.good_performance && (
                                                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                                    Good Performance
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {project.review_notes && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Review Notes</h3>
                                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                            {project.review_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rejection Reason (if rejected) */}
                        {project.status === 'rejected' && project.rejection_reason && (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                                    Rejection Reason
                                </h3>
                                <p className="text-red-700 dark:text-red-400">
                                    {project.rejection_reason}
                                </p>
                            </div>
                        )}

                        {/* Project Link */}
                        {project.project && (
                            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                                <h2 className="text-xl font-semibold mb-4">Project Link</h2>
                                <a
                                    href={project.project}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[var(--color-alpha)] hover:underline font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {project.project}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Project Info Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                                    <div>{getStatusBadge(project.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Created</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(project.created_at), 'MMM d, yyyy HH:mm')}
                                    </p>
                                </div>
                                {project.updated_at && (
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(project.updated_at), 'MMM d, yyyy HH:mm')}
                                        </p>
                                    </div>
                                )}
                                {project.approved_at && (
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Approved</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(project.approved_at), 'MMM d, yyyy HH:mm')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="text-lg font-semibold mb-4">Owner</h3>
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
                                <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                                    <h3 className="text-lg font-semibold mb-4">Approved By</h3>
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
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-light dark:bg-dark overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review & Approve Project</DialogTitle>
                        <DialogDescription>
                            Please rate the project and add any notes before approving.
                        </DialogDescription>
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
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, good_structure: checked }))
                                        }
                                    />
                                    <Label htmlFor="good_structure" className="font-normal cursor-pointer">
                                        Good Structure
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="clean_code"
                                        checked={reviewRatings.clean_code}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, clean_code: checked }))
                                        }
                                    />
                                    <Label htmlFor="clean_code" className="font-normal cursor-pointer">
                                        Clean Code
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pure_code"
                                        checked={reviewRatings.pure_code}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, pure_code: checked }))
                                        }
                                    />
                                    <Label htmlFor="pure_code" className="font-normal cursor-pointer">
                                        Pure Code
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pure_ai"
                                        checked={reviewRatings.pure_ai}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, pure_ai: checked }))
                                        }
                                    />
                                    <Label htmlFor="pure_ai" className="font-normal cursor-pointer">
                                        Pure AI
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mix_vibe"
                                        checked={reviewRatings.mix_vibe}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, mix_vibe: checked }))
                                        }
                                    />
                                    <Label htmlFor="mix_vibe" className="font-normal cursor-pointer">
                                        Mix Vibe One
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="responsive_design"
                                        checked={reviewRatings.responsive_design}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, responsive_design: checked }))
                                        }
                                    />
                                    <Label htmlFor="responsive_design" className="font-normal cursor-pointer">
                                        Responsive Design
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="good_performance"
                                        checked={reviewRatings.good_performance}
                                        onCheckedChange={(checked) =>
                                            setReviewRatings(prev => ({ ...prev, good_performance: checked }))
                                        }
                                    />
                                    <Label htmlFor="good_performance" className="font-normal cursor-pointer">
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
                        <Button
                            onClick={confirmApprove}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isProcessing ? 'Approving...' : 'Approve Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[500px] bg-light dark:bg-dark">
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
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={!rejectionReason.trim() || isProcessing}
                        >
                            {isProcessing ? 'Rejecting...' : 'Reject Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

