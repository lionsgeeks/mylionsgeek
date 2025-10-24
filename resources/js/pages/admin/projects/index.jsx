import React, { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash, MoreVertical, Plus, Search, Filter, SortAsc, SortDesc, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, FolderOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Organizing projects-pana.png"
import ProjectDashboard from './components/ProjectDashboard';

const ProjectsIndex = ({ projects, stats, filters }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
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

    const handleDelete = useCallback((projectId) => {
        if (confirm('Are you sure you want to delete this project?')) {
            destroy(`/admin/projects/${projectId}`);
        }
    }, [destroy]);

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
                {/* Project Dashboard */}
                <ProjectDashboard
                    projects={projects.data}
                    stats={stats}
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    onSort={handleSort}
                />

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <CardTitle>Projects</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64"
                                    />
                                    <Button onClick={handleSearch} size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleSearch} variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Project
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Sort Options */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={sortBy === 'name' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSort('name')}
                            >
                                Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />)}
                            </Button>
                            <Button
                                variant={sortBy === 'created_at' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSort('created_at')}
                            >
                                Date {sortBy === 'created_at' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />)}
                            </Button>
                            <Button
                                variant={sortBy === 'status' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSort('status')}
                            >
                                Status {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />)}
                            </Button>
                        </div>

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.data.map((project) => (
                                <Card key={project.id} className="relative group hover:shadow-lg transition-shadow">
                                    {project.is_updated && (
                                        <div className="absolute top-2 right-2">
                                            <Bell className="h-4 w-4 text-[var(--color-alpha)] animate-pulse" />
                                        </div>
                                    )}
                                    
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                {project.photo ? (
                                                    <img
                                                        src={`/storage/${project.photo}`}
                                                        alt={project.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-[var(--color-alpha)]/20 flex items-center justify-center">
                                                        <FolderOpen className="h-6 w-6 text-[var(--color-alpha)]" />
                                                    </div>
                                                )}
                                                <div>
                                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        by {project.creator?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.get(`/admin/projects/${project.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(project)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(project.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.description || 'No description provided'}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <Badge className={getStatusColor(project.status)}>
                                                {getStatusIcon(project.status)}
                                                <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {project.tasks_count} tasks
                                            </span>
                                        </div>

                                        {project.tasks_count > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{project.progress_percentage || 0}%</span>
                                                </div>
                                                <Progress value={project.progress_percentage || 0} className="h-2" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{project.users_count} members</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {projects.data.length === 0 && (
                            <div className="text-center py-8">
                                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No projects found</h3>
                                <p className="text-muted-foreground">Get started by creating your first project.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

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
