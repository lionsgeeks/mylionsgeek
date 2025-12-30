import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, X } from 'lucide-react';
import TablePagination from '@/components/TablePagination';


export default function ProjectsIndex({ projects, models = [] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        image: null,
        model_id: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [processing, setProcessing] = useState(false);


    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const file = e.target.files[0];
            setFormData(prev => ({
                ...prev,
                image: file,
            }));

            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);


        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('project', formData.project);
        data.append('model_id', formData.model_id);
        if (formData.image) {
            data.append('image', formData.image);
        }


        if (editingProject) {
            data.append('_method', 'PUT');
            router.post(`/projects/${editingProject.id}`, data, {
                onSuccess: () => {
                    closeModals();
                    window.location.reload();
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/projects', data, {
                onSuccess: () => {
                    closeModals();
                    window.location.reload();
                },
                onFinish: () => setProcessing(false),
            });
        }
    };


    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            project: project.project,
            image: null,
            model_id: project.model_id || '',
        });
        setImagePreview(project.image ? `/storage/${project.image}` : null);
        setIsAddModalOpen(true);
    };


    const closeModals = () => {
        setIsAddModalOpen(false);
        setEditingProject(null);
        setFormData({ title: '', description: '', project: '', image: null, model_id: '' });
        setImagePreview(null);
    };


    return (
        <AppLayout>
            <Head title="My Projects" />


            <div className="space-y-6 p-6 ">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">My Projects</h1>
                        <p className="text-neutral-500 mt-2">
                            Create and manage your portfolio projects. Submit for approval to make them visible in your profile.
                        </p>
                    </div>
                    <Button
                        className="bg-[var(--color-alpha)]  text-black hover:text-white dark:hover:text-black cursor-pointer"
                        onClick={() => {
                            setEditingProject(null);
                            setFormData({ title: '', description: '', project: '', image: null, model_id: '' });
                            setImagePreview(null);
                            setIsAddModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={closeModals}>
                    <DialogContent className="max-w-2xl max-h-[90vh] bg-[var(--color-background)] border-[var(--color-border)] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-[var(--color-foreground)] text-xl">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="model_id" className="text-[var(--color-foreground)] block mb-2">Model *</Label>
                                <Select
                                    value={formData.model_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value }))}
                                    required
                                >
                                    <SelectTrigger className="border-2 border-[var(--color-alpha)] bg-[var(--color-background)] text-[var(--color-foreground)] rounded-lg px-4 py-6 focus:outline-none focus:border-[var(--color-alpha)]">
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[var(--color-popover)] border-[var(--color-border)]">
                                        {models.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={String(model.id)}
                                                className="text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="title" className="text-[var(--color-foreground)] block mb-2">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="My Awesome Project"
                                    className="border-2 border-[var(--color-alpha)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] rounded-lg px-4 py-6 focus:outline-none focus:border-[var(--color-alpha)]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="image" className="text-[var(--color-foreground)] block mb-2">Image</Label>
                                <div className="flex items-center gap-3 rounded-lg p-1 border-2 border-[var(--color-alpha)] bg-[var(--color-background)]">
                                    <label htmlFor="image" className="bg-[var(--color-alpha)] hover:opacity-90 text-black dark:text-black px-4 py-2 rounded-lg font-semibold cursor-pointer transition">
                                        Choose File
                                    </label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        onChange={handleInputChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <span className="text-[var(--color-muted-foreground)] text-sm flex-1 truncate">
                                        {formData.image?.name || (editingProject?.image ? 'Current image will be kept' : 'No file chosen')}
                                    </span>
                                </div>

                                {imagePreview && (
                                    <div className="mt-3 relative group">
                                        <div className="relative w-full border-2 border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-muted)]/10">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-auto max-h-40 object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, image: null }));
                                                    setImagePreview(null);
                                                    // Reset file input
                                                    const fileInput = document.getElementById('image');
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                                className="absolute top-2 right-2 bg-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/90 text-white rounded-full p-1.5 shadow-lg transition-opacity opacity-0 group-hover:opacity-100"
                                                aria-label="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-[var(--color-foreground)] block mb-2">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project..."
                                    rows={4}
                                    className="border-2 border-[var(--color-alpha)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] rounded-lg px-4 py-4 focus:outline-none focus:border-[var(--color-alpha)] resize-none"
                                />
                            </div>

                            <div>
                                <Label htmlFor="project" className="text-[var(--color-foreground)] block mb-2">Project URL</Label>
                                <Input
                                    id="project"
                                    name="project"
                                    type="url"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com"
                                    className="border-2 border-[var(--color-alpha)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] rounded-lg px-4 py-6 focus:outline-none focus:border-[var(--color-alpha)]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border)] mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModals}
                                    disabled={processing}
                                    className="border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[var(--color-alpha)] text-black hover:opacity-90 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : editingProject ? 'Update Project' : 'Submit Project'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>


                {projects.data && projects.data.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 max-sm:grid-cols-1">
                            {projects.data.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={(e) => {
                                        // Don't navigate if clicking on buttons or links
                                        if (e.target.closest('button') || e.target.closest('a')) {
                                            return;
                                        }
                                        router.visit(`/student/project/${project.id}`);
                                    }}
                                >
                                    <div className="flex flex-col gap-4 relative">
                                        <div className="flex justify-end absolute right-0">
                                            <span
                                                className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${
                                                    project.status === 'approved'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-50'
                                                        : project.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-50'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-50'
                                                }`}
                                            >
                                                {project.status === 'pending' ? 'Pending' : project.status}
                                            </span>
                                        </div>
                                        {/* Image */}
                                        {project.image && (
                                            <div className="w-full h-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={`/storage/${project.image}`}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}


                                        {/* Content */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className=''>
                                                    <h3 className="text-lg font-semibold">{project.title}</h3>

                                                    <p className="text-sm text-neutral-500">
                                                        {new Date(project.created_at).toLocaleString('fr-FR', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/student/project/${project.id}`);
                                                    }}
                                                    className="text-[var(--color-alpha)] hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View Project
                                                </button>
                               
                                            </div>
                                            {project.status === 'rejected' && (
                                            <div className="text-red-500 py-2">
                                                <span>Your project is rejected : </span>
                                                <span>{project.rejection_reason}</span>
                                            </div>
                                            )}
                                            {(project.status === "pending" || project.status === "rejected") && (
                                            <Button className="w-full cursor-pointer text-dark hover:text-light dark:hover:text-dark" onClick={() => handleEdit(project)}>
                                                Edit project
                                            </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* Pagination */}
                        {projects.meta && (
                            <TablePagination
                                current_page={projects.meta.current_page}
                                last_page={projects.meta.last_page}
                                per_page={projects.meta.per_page}
                                total={projects.meta.total}
                                onPageChange={(page) => router.get(`/projects?page=${page}`)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-neutral-500 mb-4">No projects yet. Create your first project!</p>
                        <Button className="bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
