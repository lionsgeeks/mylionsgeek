import TablePagination from '@/components/TablePagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Eye, Plus, X } from 'lucide-react';
import { useState } from 'react';

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
            setFormData((prev) => ({
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
            setFormData((prev) => ({
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
            title: project.title || '',
            description: project.description || '',
            project: project.project || '',
            image: null,
            model_id: project.model_id ? String(project.model_id) : '',
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

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Projects</h1>
                        <p className="mt-2 text-neutral-500">
                            Create and manage your portfolio projects. Submit for approval to make them visible in your profile.
                        </p>
                    </div>
                    <Button
                        className="cursor-pointer bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black"
                        onClick={() => {
                            setEditingProject(null);
                            setFormData({ title: '', description: '', project: '', image: null, model_id: '' });
                            setImagePreview(null);
                            setIsAddModalOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                    </Button>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={closeModals}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[var(--color-border)] bg-[var(--color-background)]">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[var(--color-foreground)]">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="model_id" className="mb-2 block text-[var(--color-foreground)]">
                                    Model *
                                </Label>
                                <Select
                                    value={formData.model_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, model_id: value }))}
                                    required
                                >
                                    <SelectTrigger className="rounded-lg border-2 border-[var(--color-alpha)] bg-[var(--color-background)] px-4 py-6 text-[var(--color-foreground)] focus:border-[var(--color-alpha)] focus:outline-none">
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent className="border-[var(--color-border)] bg-[var(--color-popover)]">
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
                                <Label htmlFor="title" className="mb-2 block text-[var(--color-foreground)]">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="My Awesome Project"
                                    className="rounded-lg border-2 border-[var(--color-alpha)] bg-[var(--color-background)] px-4 py-6 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-alpha)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <Label htmlFor="image" className="mb-2 block text-[var(--color-foreground)]">
                                    Image
                                </Label>
                                <div className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-alpha)] bg-[var(--color-background)] p-1">
                                    <label
                                        htmlFor="image"
                                        className="cursor-pointer rounded-lg bg-[var(--color-alpha)] px-4 py-2 font-semibold text-black transition hover:opacity-90 dark:text-black"
                                    >
                                        Choose File
                                    </label>
                                    <Input id="image" name="image" type="file" onChange={handleInputChange} accept="image/*" className="hidden" />
                                    <span className="flex-1 truncate text-sm text-[var(--color-muted-foreground)]">
                                        {formData.image?.name || (editingProject?.image ? 'Current image will be kept' : 'No file chosen')}
                                    </span>
                                </div>

                                {imagePreview && (
                                    <div className="group relative mt-3">
                                        <div className="relative w-full overflow-hidden rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-muted)]/10">
                                            <img src={imagePreview} alt="Preview" className="h-auto max-h-40 w-full rounded-lg object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, image: null }));
                                                    setImagePreview(null);
                                                    // Reset file input
                                                    const fileInput = document.getElementById('image');
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                                className="absolute top-2 right-2 rounded-full bg-[var(--color-destructive)] p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-[var(--color-destructive)]/90"
                                                aria-label="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description" className="mb-2 block text-[var(--color-foreground)]">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project..."
                                    rows={4}
                                    className="resize-none rounded-lg border-2 border-[var(--color-alpha)] bg-[var(--color-background)] px-4 py-4 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-alpha)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <Label htmlFor="project" className="mb-2 block text-[var(--color-foreground)]">
                                    Project URL
                                </Label>
                                <Input
                                    id="project"
                                    name="project"
                                    type="url"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com"
                                    className="rounded-lg border-2 border-[var(--color-alpha)] bg-[var(--color-background)] px-4 py-6 text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-alpha)] focus:outline-none"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModals}
                                    disabled={processing}
                                    className="cursor-pointer border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer bg-[var(--color-alpha)] text-black hover:opacity-90"
                                >
                                    {processing ? 'Saving...' : editingProject ? 'Update Project' : 'Submit Project'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {projects.data && projects.data.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                            {projects.data.map((project) => (
                                <div
                                    key={project.id}
                                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                                    onClick={(e) => {
                                        // Don't navigate if clicking on buttons or links
                                        if (e.target.closest('button') || e.target.closest('a')) {
                                            return;
                                        }
                                        router.visit(`/students/project/${project.id}`);
                                    }}
                                >
                                    <div className="relative flex flex-col gap-4">
                                        <div className="absolute right-0 flex justify-end">
                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
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
                                            <div className="h-50 w-full flex-shrink-0 overflow-hidden rounded-lg">
                                                <img src={`/storage/${project.image}`} alt={project.title} className="h-full w-full object-cover" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between">
                                                <div className="">
                                                    <h3 className="text-lg font-semibold">{project.title}</h3>

                                                    <p className="text-sm text-neutral-500">
                                                        {new Date(project.created_at).toLocaleString('fr-FR', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/students/project/${project.id}`);
                                                    }}
                                                    className="flex items-center gap-1 text-sm text-[var(--color-alpha)] hover:underline"
                                                >
                                                    <Eye size={16} />
                                                    View Project
                                                </button>
                                            </div>
                                            {project.status === 'rejected' && (
                                                <div className="py-2 text-red-500">
                                                    <span>Your project is rejected : </span>
                                                    <span>{project.rejection_reason}</span>
                                                </div>
                                            )}
                                            {(project.status === 'pending' || project.status === 'rejected') && (
                                                <Button
                                                    className="w-full cursor-pointer text-dark hover:text-light dark:hover:text-dark"
                                                    onClick={() => handleEdit(project)}
                                                >
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
                    <div className="py-12 text-center">
                        <p className="mb-4 text-neutral-500">No projects yet. Create your first project!</p>
                        <Button
                            className="cursor-pointer bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
