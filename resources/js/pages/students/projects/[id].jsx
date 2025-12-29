import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import Rolegard from '@/components/rolegard';
import { format } from 'date-fns';

export default function ProjectShow({ project }) {
    const { auth } = usePage().props;
    const isOwner = project.user_id === auth.user.id;
    const isAdmin = ['admin', 'super_admin', 'moderateur', 'coach'].includes(auth.user.role);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
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
        setIsProcessing(true);
        router.post(`/admin/projects/${project.id}/approve`, {}, {
            onSuccess: () => {
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
            rejection_reason: rejectionReason.trim()
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

            {/* Rejection Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[500px]">
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

