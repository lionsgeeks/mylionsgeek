import { Briefcase, Edit, ExternalLink, Github, Instagram, Linkedin, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { helpers } from './utils/helpers';

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
                links: newLinks.map((link) => link.id),
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to reorder social links');
                }
                return response.json();
            })
            .then((data) => {
                //console.log('Social links reordered successfully');
            })
            .catch((error) => {
                console.error('Failed to reorder social links:', error);
                // Revert to original order on error
                setModalLinks(links);
            });
    };

    if (!open) return null;

    return (
        <>
            <div
                onClick={() => onOpenChange(false)}
                className="fixed inset-0 z-30 h-full bg-black/50 backdrop-blur-md transition-all duration-300 dark:bg-black/70"
            />
            <div className="fixed inset-0 top-1/2 z-50 mx-auto flex h-fit w-[70%] -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-light sm:w-[520px] dark:bg-beta">
                <div className="max-h-[90vh] w-full overflow-y-auto rounded-lg bg-light shadow-2xl dark:bg-dark">
                    <div className="sticky top-0 flex items-center justify-between border-b border-beta/20 bg-light p-4 dark:border-light/10 dark:bg-dark">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">Socials</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer text-beta/60 transition-colors hover:text-beta dark:text-light/60 dark:hover:text-light"
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
                                            className={`group flex items-center justify-between gap-3 rounded-lg border border-beta/10 p-3 transition hover:bg-beta/5 dark:border-light/10 dark:hover:bg-light/5 ${
                                                canManage ? 'cursor-move' : ''
                                            } ${draggedItem === index ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-beta/5 dark:bg-light/5">
                                                    <IconComponent className="h-4 w-4 text-beta/70 dark:text-light/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block truncate text-sm font-semibold text-beta hover:underline dark:text-light"
                                                    >
                                                        {link.title}
                                                    </a>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block truncate text-xs text-beta/60 hover:underline dark:text-light/60"
                                                    >
                                                        {link.url}
                                                    </a>
                                                </div>
                                            </div>

                                            {canManage && (
                                                <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit?.(link)}
                                                        className="cursor-pointer text-alpha transition-colors hover:text-alpha/80"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete?.(link)}
                                                        className="cursor-pointer text-error transition-colors hover:text-error/80"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
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
