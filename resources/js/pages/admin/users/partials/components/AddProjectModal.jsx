import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function AddProjectModal({ isOpen, onClose, userId, onProjectAdded }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    description: '',
    url: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('url', formData.url);
    if (formData.image) data.append('image', formData.image);

    fetch(`/admin/users/${userId}/projects`, {
        method: 'POST',
        headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        },
        body: data,
        credentials: 'same-origin',
    })
        .then(r => r.json())
        .then(({ project }) => {
        handleClose();
        setProcessing(false);

        onProjectAdded?.(project);
        })
        .catch(() => {
        setProcessing(false);
        });
    };



const handleClose = () => {
  setFormData({ title:'', image:null, description:'', url:'' });
  setImagePreview(null);
  setErrors({});
  onClose();
};

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full mt-1.5 px-4 py-2.5 border-2 border-[var(--color-alpha)] rounded-lg focus:ring-2 focus:ring-[var(--color-alpha)] focus:border-[var(--color-alpha)] dark:bg-neutral-800 dark:text-white transition-all"
              required
              disabled={processing}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label>Image</Label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full mt-1.5 px-4 py-2.5 border-2 border-[var(--color-alpha)] rounded-lg focus:ring-2 focus:ring-[var(--color-alpha)] focus:border-[var(--color-alpha)] dark:bg-neutral-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-alpha)] file:text-black dark:hover:file:bg-gray-200 hover:file:bg-gray-900 dark:hover:file:text-black hover:file:text-gray-50 file:transition-colors file:cursor-pointer transition-all cursor-pointer"
              disabled={processing}
            />
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mt-4 w-full h-48 object-cover rounded-lg border border-alpha/20" 
              />
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="4"
              className="w-full mt-1.5 px-4 py-2.5 border-2 border-[var(--color-alpha)] rounded-lg focus:ring-2 focus:ring-[var(--color-alpha)] focus:border-[var(--color-alpha)] dark:bg-neutral-800 dark:text-white transition-all resize-none"
              required
              disabled={processing}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label>Project URL</Label>
            <input
              type="url"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full mt-1.5 px-4 py-2.5 border-2 border-[var(--color-alpha)] rounded-lg focus:ring-2 focus:ring-[var(--color-alpha)] focus:border-[var(--color-alpha)] dark:bg-neutral-800 dark:text-white transition-all"
              placeholder="https://example.com"
              required
              disabled={processing}
            />
            {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-[var(--color-alpha)] text-black dark:hover:bg-gray-200 hover:bg-gray-900 hover:text-white dark:hover:text-black transition-colors cursor-pointer "
            >
              {processing ? 'Adding...' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
