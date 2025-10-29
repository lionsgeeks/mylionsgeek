import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    FolderOpen,
    MoreHorizontal,
    Share2,
    Target,
    Trash,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const ProjectHeader = ({ project, teamMembers, tasks = [] }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const {
        data: editData,
        setData: setEditData,
        put: updateProject,
    } = useForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'on_hold':
                return <Clock className="h-4 w-4" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <FolderOpen className="h-4 w-4" />;
        }
    };

    // Calculate dynamic project stats
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate days until deadline
    const getDaysUntilDeadline = () => {
        if (!project.end_date) return null;
        const today = new Date();
        const deadline = new Date(project.end_date);
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDeadline = getDaysUntilDeadline();

    const handleUpdateProject = () => {
        updateProject(`/admin/projects/${project.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
            },
            onError: (errors) => {
                console.error('Failed to update project:', errors);
                alert('Failed to update project: ' + (errors.message || 'Unknown error'));
            },
        });
    };

    const handleDeleteProject = () => {
        router.delete(`/admin/projects/${project.id}`, {
            onSuccess: () => {
                router.visit('/admin/projects');
            },
            onError: (errors) => {
                console.error('Failed to delete project:', errors);
                alert('Failed to delete project: ' + (errors.message || 'Unknown error'));
            },
        });
    };

    return (
        <>
            {/* Project Banner */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-r from-[var(--color-alpha)]/70 via-[var(--color-alpha)]/50 to-[var(--color-alpha)]/30">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 h-32 w-32 rounded-full bg-white/20 blur-xl"></div>
                    <div className="absolute right-4 bottom-4 h-24 w-24 rounded-full bg-white/20 blur-lg"></div>
                    <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white/10 blur-2xl"></div>
                </div>

                {/* Project Info Overlay */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                                    <FolderOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                                    <p className="text-white/80">by {project.creator?.name || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setIsShareModalOpen(true)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsShareModalOpen(true)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Invite Members
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="text-destructive">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                                {getStatusIcon(project.status)}
                                {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{teamMembers?.length || 0} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Management Cards */}
            <div className="relative z-20 -mt-8 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Quick Stats */}
                    <Card className="border-border bg-background/80 shadow-lg backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                                    <p className="text-2xl font-bold text-foreground">{progressPercentage}%</p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-alpha)]/10 p-2">
                                    <TrendingUp className="h-5 w-5 text-[var(--color-alpha)]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-background/80 shadow-lg backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                                    <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-alpha)]/10 p-2">
                                    <CheckCircle className="h-5 w-5 text-[var(--color-alpha)]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-background/80 shadow-lg backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Team</p>
                                    <p className="text-2xl font-bold text-foreground">{teamMembers?.length || 0}</p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-alpha)]/10 p-2">
                                    <Users className="h-5 w-5 text-[var(--color-alpha)]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-background/80 shadow-lg backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {daysUntilDeadline !== null ? (daysUntilDeadline > 0 ? `${daysUntilDeadline}` : 'Overdue') : 'No deadline'}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-alpha)]/10 p-2">
                                    <Target className="h-5 w-5 text-[var(--color-alpha)]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Project Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update project details and settings</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" value={editData.name} onChange={(e) => setEditData('name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={editData.description} onChange={(e) => setEditData('description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={editData.status} onValueChange={(value) => setEditData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={editData.start_date}
                                    onChange={(e) => setEditData('start_date', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input id="end_date" type="date" value={editData.end_date} onChange={(e) => setEditData('end_date', e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateProject}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Project Modal */}
            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Project</DialogTitle>
                        <DialogDescription>Invite team members to collaborate on this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" placeholder="Enter email address" />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button>Send Invitation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive Project Modal */}
            <Dialog open={isArchiveModalOpen} onOpenChange={setIsArchiveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Project</DialogTitle>
                        <DialogDescription>Are you sure you want to archive this project? It will be moved to archived projects.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsArchiveModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive">Archive Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Project Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this project? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProjectHeader;
