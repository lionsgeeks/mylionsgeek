import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye } from 'lucide-react';
import TablePagination from '@/components/TablePagination';


export default function ProjectsIndex({ projects }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        image: null,
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
        });
        setImagePreview(project.image ? `/storage/${project.image}` : null);
        setIsAddModalOpen(true);
    };


    const closeModals = () => {
        setIsAddModalOpen(false);
        setEditingProject(null);
        setFormData({ title: '', description: '', project: '', image: null });
        setImagePreview(null);
    };


    return (
        <AppLayout>
            <Head title="My Projects" />


            <div className="space-y-6 p-6 mt-10">
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
                            setFormData({ title: '', description: '', url: '', image: null });
                            setImagePreview(null);
                            setIsAddModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={closeModals}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title" className="text-white block mb-2">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="My Awesome Project"
                                    className=" border-2 border-[var(--color-alpha)] text-white placeholder-gray-500 rounded-lg px-4 py-6 focus:outline-none focus:border-[var(--color-alpha)]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="image" className="text-white block mb-2">Image</Label>
                                <div className="flex items-center gap-3 rounded-lg p-1 border-2 border-[var(--color-alpha)]">
                                    <label htmlFor="image" className="bg-[var(--color-alpha)] hover:bg-gray-950 text-black hover:text-white dark:hover:text-black dark:hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold cursor-pointer transition">
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
                                    <span className="text-gray-400 text-sm">
                                        {formData.image?.name || (editingProject?.image ? 'Current image will be kept' : 'No file chosen')}
                                    </span>
                                </div>
                                
                                {imagePreview && (
                                    <div className="mt-3 rounded-lg overflow-hidden ">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-auto max-h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-white block mb-2">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project..."
                                    rows={4}
                                    className=" border-2 border-[var(--color-alpha)] text-white placeholder-gray-500 rounded-lg px-4 py-4 focus:outline-none focus:border-[var(--color-alpha)] resize-none"
                                />
                            </div>

                            <div>
                                <Label htmlFor="project" className="text-white block mb-2">Project URL</Label>
                                <Input
                                    id="project"
                                    name="project"
                                    type="url"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com"
                                    className=" border-2 border-[var(--color-alpha)] text-white placeholder-gray-500 rounded-lg px-4 py-6 focus:outline-none focus:border-[var(--color-alpha)]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={closeModals}
                                    disabled={processing}
                                    className=" text-whit2 border-gray-700 hover:bg-gray-900 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-[var(--color-alpha)] text-black hover:text-white dark:hover:text-black cursor-pointer"
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
                                    className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-lg transition-shadow"
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
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className='my-3'>
                                                    <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                                                        {project.description}
                                                    </p>
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
                                                {project.project && (
                                                    <a
                                                        href={project.project}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--color-alpha)] hover:underline text-sm flex items-center gap-1"
                                                    >
                                                        <Eye size={16} />
                                                        View Project
                                                    </a>
                                                )}
                                            </div>
                                            {project.status === 'rejected' && (
                                            <div className="text-red-500 py-2">
                                                <span>Your project is rejected : </span>
                                                <span>{project.rejection_reason}</span>
                                            </div>
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
