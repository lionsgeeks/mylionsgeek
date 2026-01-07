import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Edit, Trash, Github, Linkedin, Instagram, Briefcase } from 'lucide-react';
import { helpers } from './utils/helpers';
import DeleteModal from './DeleteModal';

const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    behance: ExternalLink,
    github: Github,
    portfolio: Briefcase,
};

const SocialLinksModal = ({ open, onOpenChange, links = [], canManage = false, onEdit, onDelete, onOrderChange }) => {
    const { stopScrolling } = helpers();
    const [draggedItem, setDraggedItem] = useState(null);
    const [modalLinks, setModalLinks] = useState(links);

    // Update modalLinks when links prop changes
    useEffect(() => {
        setModalLinks(links);
    }, [links]);

    useEffect(() => {
        stopScrolling(open);
        return () => stopScrolling(false);
    }, [open]);

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        if (!canManage) return;
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        if (!canManage) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        
        if (!canManage || draggedItem === null) return;
        
        const draggedLink = modalLinks[draggedItem];
        const newLinks = [...modalLinks];
        
        // Remove the dragged item
        newLinks.splice(draggedItem, 1);
        
        // Insert at the new position
        newLinks.splice(dropIndex, 0, draggedLink);
        
        setModalLinks(newLinks);
        setDraggedItem(null);
        
        // Update the order on the server
        updateSocialLinksOrder(newLinks);
        
        // Notify parent component of the order change
        if (onOrderChange) {
            onOrderChange(newLinks);
        }
    };

    const updateSocialLinksOrder = (newLinks) => {
        fetch('/students/social-links/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                links: newLinks.map(link => link.id)
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reorder social links');
            }
            return response.json();
        })
        .then(data => {
            //console.log('Social links reordered successfully');
        })
        .catch(error => {
            console.error('Failed to reorder social links:', error);
            // Revert to original order on error
            setModalLinks(links);
        });
    };

    if (!open) return null;

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" />
            <div className="fixed inset-0 h-fit mx-auto w-[70%] sm:w-[520px] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-light dark:bg-dark border-b border-beta/20 dark:border-light/10 p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">Socials</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="space-y-2">
                            {(modalLinks || []).length === 0 ? (
                                <p className="text-sm text-beta/60 dark:text-light/60">No links added.</p>
                            ) : (
                                (modalLinks || []).map((link, index) => {
                                    const IconComponent = platformIcons[link.title] || ExternalLink;
                                    return (
                                        <div
                                            key={link.id}
                                            draggable={canManage}
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className={`flex items-center justify-between gap-3 rounded-lg border border-beta/10 dark:border-light/10 p-3 hover:bg-beta/5 dark:hover:bg-light/5 transition group ${
                                                canManage ? 'cursor-move' : ''
                                            } ${draggedItem === index ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-beta/5 dark:bg-light/5 flex items-center justify-center flex-shrink-0">
                                                    <IconComponent className="w-4 h-4 text-beta/70 dark:text-light/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-sm font-semibold text-beta dark:text-light hover:underline truncate block"
                                                    >
                                                        {link.title}
                                                    </a>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-beta/60 dark:text-light/60 hover:underline truncate block"
                                                    >
                                                        {link.url}
                                                    </a>
                                                </div>
                                            </div>

                                            {canManage && (
                                                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit?.(link)}
                                                        className="text-alpha cursor-pointer hover:text-alpha/80 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete?.(link)}
                                                        className="text-error cursor-pointer hover:text-error/80 transition-colors"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SocialLinksModal;
