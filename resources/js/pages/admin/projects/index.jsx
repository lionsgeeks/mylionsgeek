import React, { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
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
import { CheckCircle, Clock, AlertCircle, FolderOpen } from 'lucide-react';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Organizing projects-pana.png"

const ProjectsIndex = ({ projects, stats, filters }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [clientFilter, setClientFilter] = useState(filters?.client || '');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || 'desc');

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
        post('/admin/projects', {
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
    }, [post, setData]);

    const handleEdit = useCallback((project) => {
        setEditingProject(project);
        setData({
            name: project.name,
            description: project.description || '',
            photo: null,
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            status: project.status
        });
        setIsEditModalOpen(true);
    }, [setData]);

    const handleUpdate = useCallback((e) => {
        e.preventDefault();
        put(`/admin/projects/${editingProject.id}`, {
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
    }, [put, editingProject, setData]);

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

                {/* Projects Grid - Jira/Agile Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.data.map((project) => (
                        <div 
                            key={project.id} 
                            className="group relative bg-white dark:bg-transparent rounded-lg border border-dark/10 dark:border-light/30 hover:border-[var(--color-alpha)] dark:hover:border-[var(--color-alpha)] transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl cursor-pointer"
                            onClick={() => router.get(`/admin/projects/${project.id}`)}
                        >
                            {/* Project Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {project.photo ? (
                                            <img
                                                src={`/storage/${project.photo}`}
                                                alt={project.name}
                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-alpha)] to-[var(--color-alpha)]/80 flex items-center justify-center flex-shrink-0">
                                                <FolderOpen className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                by {project.creator?.name}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
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

                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                    {project.description || 'No description provided'}
                                </p>

                                <div className="flex items-center justify-between">
                                    <Badge className={`${getStatusColor(project.status)} flex items-center gap-1 text-xs`}>
                                        {getStatusIcon(project.status)}
                                        <span className="capitalize">{project.status.replace('_', ' ')}</span>
                                    </Badge>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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

                            {/* Progress Section */}
                            {project.tasks_count > 0 && (
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                        <span className="text-sm font-semibold text-[var(--color-alpha)]">{project.progress_percentage || 0}%</span>
                                    </div>
                                    <Progress value={project.progress_percentage || 0} className="h-2" />
                                </div>
                            )}

                            {/* Team Members & Actions */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            {project.users?.slice(0, 4).map((user, index) => (
                                                <div
                                                    key={user.id}
                                                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800 shadow-sm"
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {project.users_count > 4 && (
                                                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                                                    +{project.users_count - 4}
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
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex items-center gap-1 text-xs h-7"
                                        onClick={(e) => { e.stopPropagation(); }}
                                    >
                                        <UserPlus className="h-3 w-3" />
                                        Invite
                                    </Button>
                                    <div className="flex items-center gap-3">
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
                            <Input
                                id="edit_photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('photo', e.target.files[0])}
                            />
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
        </AppLayout>
    );
};

export default ProjectsIndex;
