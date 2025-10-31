import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ViewProjectModal({ isOpen, onClose, project }) {
    const [copied, setCopied] = useState(false);

    const copyUrl = () => {
        if (project?.url) {
            navigator.clipboard.writeText(project.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const openUrl = () => {
        if (project?.url) {
            window.open(project.url, '_blank');
        }
    };

    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Project Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <img 
                        src={`/storage/${project.image}`} 
                        alt={project.title}
                        className="w-full h-96 object-cover rounded-lg border border-alpha/20"
                    />

                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {project.title}
                        </h3>
                    </div>

                    <div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-2">Project URL</Label>
                        <div className="flex gap-2 mt-1.5 items-center">
                            <input
                                type="text"
                                value={project.url}
                                readOnly
                                onClick={copyUrl}
                                className="flex-1 px-4 py-2.5 border border-alpha/30 rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white cursor-pointer hover:border-[var(--color-alpha)] transition-all"
                            />
                            <Button
                                onClick={copyUrl}
                                variant="outline"
                                className="px-4 cursor-pointer"
                            >
                                {copied ? '✓ Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="cursor-pointer"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={openUrl}
                            className="bg-[var(--color-alpha)] text-black hover:bg-gray-900 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-black transition-colors duration-200 cursor-pointer"
                        >
                            Open URL →
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
