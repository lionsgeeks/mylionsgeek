import React, { useEffect } from 'react';
import { X, ExternalLink, Pencil, Trash } from 'lucide-react';
import { helpers } from './utils/helpers';

const SocialLinksModal = ({ open, onOpenChange, links = [], canManage = false, onEdit, onDelete }) => {
    const { stopScrolling } = helpers();

    useEffect(() => {
        stopScrolling(open);
        return () => stopScrolling(false);
    }, [open]);

    if (!open) return null;

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" />
            <div className="fixed inset-0 h-fit mx-auto w-[70%] sm:w-[520px] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-light dark:bg-dark border-b border-beta/20 dark:border-light/10 p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">Contact info</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="space-y-2">
                            {(links || []).length === 0 ? (
                                <p className="text-sm text-beta/60 dark:text-light/60">No links added.</p>
                            ) : (
                                (links || []).map((link) => (
                                    <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-beta/10 dark:border-light/10 p-3 hover:bg-beta/5 dark:hover:bg-light/5 transition group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-beta/5 dark:bg-light/5 flex items-center justify-center flex-shrink-0">
                                                <ExternalLink className="w-4 h-4 text-beta/70 dark:text-light/70" />
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
                                                    className="text-alpha"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(link)}
                                                    className="text-error"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SocialLinksModal;
