import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash, MoreVertical, Plus, Search, Filter, SortAsc, SortDesc, Bell, X, Users, Calendar, FileText, Star, UserPlus, Eye, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, FolderOpen, Share2 } from 'lucide-react';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Organizing projects-pana.png"
import AdvancedInviteModal from './components/AdvancedInviteModal'
import { useInitials } from '@/hooks/use-initials';
import { Avatar, } from '@/components/ui/avatar';
import FlashMessage from '@/components/FlashMessage';


const ProjectsIndex = ({ projects, stats, filters, flash, users = [] }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);
    const [invitingProject, setInvitingProject] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);

    // Get flash messages from Inertia
    const { flash: pageFlash } = usePage().props;

    // Handle flash messages
    useEffect(() => {
        if (pageFlash?.success) {
            setFlashMessage({ message: pageFlash.success, type: 'success' });
        } else if (pageFlash?.error) {
            setFlashMessage({ message: pageFlash.error, type: 'error' });
        }
    }, [pageFlash]);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [clientFilter, setClientFilter] = useState(filters?.client || '');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || 'desc');
    const getInitials = useInitials();

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        name: '',
        description: '',
        photo: null,
        start_date: '',
        end_date: '',
        status: 'active'
    });

    const handleCreate = useCallback((e) => {
        e.preventDefault();

        // Transform data to FormData if photo is present
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('status', data.status);
        formData.append('start_date', data.start_date || '');
        formData.append('end_date', data.end_date || '');

        if (data.photo) {
            formData.append('photo', data.photo);
        }

        post('/admin/projects', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setData({
                    name: '',
                    description: '',
                    photo: null,
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
            }
        });
    }, [post, setData, data]);

    const handleEdit = useCallback((project) => {
        setEditingProject(project);
        setData({
            name: project.name,
            description: project.description || '',
            photo: project.photo || null, // Keep existing photo
            start_date: project.start_date ? project.start_date.split('T')[0] : '', // Format for date input
            end_date: project.end_date ? project.end_date.split('T')[0] : '', // Format for date input
            status: project.status
        });
        setIsEditModalOpen(true);
    }, [setData]);

    const handleUpdate = useCallback((e) => {
        e.preventDefault();
        //(data.photo);

        // Transform data to FormData if photo is present
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('status', data.status);
        formData.append('start_date', data.start_date || '');
        formData.append('end_date', data.end_date || '');

        if (data.photo) {
            formData.append('photo', data.photo);
        }

        post(`/admin/projects/${editingProject.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingProject(null);
                setData({
                    name: '',
                    description: '',
                    photo: null,
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
            }
        });
    }, [post, editingProject, setData, data]);

    const handleDelete = useCallback((project) => {
        setDeletingProject(project);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deletingProject) {
            destroy(`/admin/projects/${deletingProject.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setDeletingProject(null);
                }
            });
        }
    }, [destroy, deletingProject]);

    const handleInvite = useCallback((project) => {
        setInvitingProject(project);
        setIsInviteModalOpen(true);
    }, []);

    const handleSearch = useCallback(() => {
        router.get('/admin/projects', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true
        });
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    const handleSort = useCallback((field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);
        router.get('/admin/projects', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            sort_by: field,
            sort_order: newOrder
        }, {
            preserveState: true,
            replace: true
        });
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    const handleFilter = useCallback(() => {
        router.get('/admin/projects', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true
        });
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }, []);

    const getStatusIcon = useCallback((status) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'on_hold': return <Clock className="h-4 w-4" />;
            case 'cancelled': return <AlertCircle className="h-4 w-4" />;
            default: return <FolderOpen className="h-4 w-4" />;
        }
    }, []);

    const chartData = useMemo(() => [
        { name: 'Active', value: stats.active, color: '#10b981' },
        { name: 'Completed', value: stats.completed, color: '#3b82f6' },
        { name: 'On Hold', value: stats.on_hold, color: '#f59e0b' },
        { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' }
    ], [stats]);

    return (
        <AppLayout>
            <Head title="Projects Management" />

            <Banner
                illustration={illustration}
                greeting="Welcome"
                userName="Admin"
                title="Project Management System"
                description="Manage your projects, track progress, and collaborate with your team efficiently."
            />

            <div className="p-6 space-y-6">
                {/* Flash Messages */}
                {flashMessage && (
                    <FlashMessage
                        message={flashMessage.message}
                        type={flashMessage.type}
                        onClose={() => setFlashMessage(null)}
                    />
                )}

                {/* Header with Search and Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Projects</h1>
                        <Badge variant="secondary" className="text-sm">
                            {projects.data.length} projects
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsFiltersOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Projects Grid - Compact Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.data.map((project) => (
                        <div
                            key={project.id}
                            className="group relative bg-white dark:bg-transparent rounded-lg border border-dark/10 dark:border-light/30 hover:border-[var(--color-alpha)] dark:hover:border-[var(--color-alpha)] transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl cursor-pointer flex flex-col h-80"
                            onClick={() => router.get(`/admin/projects/${project.id}`)}
                        >
                            {/* Project Header - Compact */}
                            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {project.photo ? (
                                            <img
                                                src={`/storage/${project.photo}`}
                                                alt={project.name}
                                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-alpha)] to-[var(--color-alpha)]/80 flex items-center justify-center flex-shrink-0">
                                                <FolderOpen className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{project.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                by {project.creator?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.get(`/admin/projects/${project.id}`); }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(project); }}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => { e.stopPropagation(); handleDelete(project); }}
                                                className="text-red-600"
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge className={`${getStatusColor(project.status)} flex items-center gap-1 text-xs px-2 py-1`}>
                                        {getStatusIcon(project.status)}
                                        <span className="capitalize text-xs">{project.status.replace('_', ' ')}</span>
                                    </Badge>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <CheckSquare className="h-3 w-3" />
                                            <span>{project.tasks_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{project.users_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description - Fixed Height */}
                            <div className="p-3 flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-5  overflow-hidden">
                                    {project.description || 'No description provided'}
                                </p>
                            </div>

                            {/* Progress Section - Compact */}
                            {project.tasks_count > 0 && (
                                <div className="px-3 pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                        <span className="text-xs font-semibold text-[var(--color-alpha)]">{project.progress_percentage || 0}%</span>
                                    </div>
                                    <Progress value={project.progress_percentage || 0} className="h-1" />
                                </div>
                            )}

                            {/* Footer - Fixed Height */}
                            <div className="p-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            {project.users?.slice(0, 3).map((user, index) => (
                                                // <Avatar key={user.id} className="w-6 h-6 overflow-hidden rounded-full border border-white dark:border-gray-800">
                                                //     <AvatarImage
                                                //         src={`/storage/${user.image}`}
                                                //         alt={user.name}
                                                //     />
                                                //     <AvatarFallback className="rounded-lg text-xs bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                //         {getInitials(user.name)}
                                                //     </AvatarFallback>
                                                // </Avatar>
                                                <Avatar
                                                    className="w-6 h-6"
                                                    image={user.image}
                                                    name={user.name}
                                                    onlineCircleClass="hidden"
                                                />
                                            ))}
                                            {project.users_count > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium border border-white dark:border-gray-800">
                                                    +{project.users_count - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{project.users_count} members</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 text-xs h-6 px-2"
                                            onClick={(e) => { e.stopPropagation(); handleInvite(project); }}
                                        >
                                            <UserPlus className="h-3 w-3" />
                                            Invite
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 text-xs h-6 px-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const inviteLink = `${window.location.origin}/projects/${project.id}/join`;
                                                navigator.clipboard.writeText(inviteLink);
                                                // You could add a toast notification here
                                            }}
                                        >
                                            <Share2 className="h-3 w-3" />
                                            Copy Link
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Star className="h-3 w-3" />
                                            <span>0</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Bell className="h-3 w-3" />
                                            <span>2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {projects.data.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-alpha)]/10 to-[var(--color-alpha)]/5 flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-[var(--color-alpha)]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-6">Get started by creating your first project.</p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                        </Button>
                    </div>
                )}
            </div>

            {/* Project Filters Sidebar */}
            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Project Filters</span>
                            <Button variant="ghost" size="sm" onClick={() => setIsFiltersOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                placeholder="Search Project"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
                                    className="justify-start"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Active
                                </Button>
                                <Button
                                    variant={statusFilter === 'on_hold' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'on_hold' ? '' : 'on_hold')}
                                    className="justify-start"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    On-going
                                </Button>
                                <Button
                                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'completed' ? '' : 'completed')}
                                    className="justify-start"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Paused
                                </Button>
                                <Button
                                    variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'cancelled' ? '' : 'cancelled')}
                                    className="justify-start"
                                >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Canceled
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="development">Development</SelectItem>
                                    <SelectItem value="research">Research</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select value={clientFilter} onValueChange={setClientFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="external">External</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    handleFilter();
                                    setIsFiltersOpen(false);
                                }}
                                className="flex-1"
                            >
                                Done
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsFiltersOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Are you sure you want to delete <strong>{deletingProject?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Project Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter project description"
                                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Project Photo</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files[0])}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Project Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_name">Project Name *</Label>
                                <Input
                                    id="edit_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_description">Description</Label>
                            <textarea
                                id="edit_description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter project description"
                                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_start_date">Start Date</Label>
                                <Input
                                    id="edit_start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_end_date">End Date</Label>
                                <Input
                                    id="edit_end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_photo">Project Photo</Label>
                            {editingProject?.photo && (
                                <div className="mb-2">
                                    <p className="text-sm text-muted-foreground mb-2">Current photo:</p>
                                    <img
                                        src={`/storage/${editingProject.photo}`}
                                        alt="Current project photo"
                                        className="w-20 h-20 object-cover rounded-md border"
                                    />
                                </div>
                            )}
                            <Input
                                id="edit_photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files[0])}
                            />
                            <p className="text-xs text-muted-foreground">Leave empty to keep current photo</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                {processing ? 'Updating...' : 'Update Project'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Invite Modal */}
            <AdvancedInviteModal
                isOpen={isInviteModalOpen}
                onClose={() => {
                    setIsInviteModalOpen(false);
                    setInvitingProject(null);
                }}
                projectId={invitingProject?.id}
                projectName={invitingProject?.name}
                users={users}
            />
        </AppLayout>
    );
};

export default ProjectsIndex;
