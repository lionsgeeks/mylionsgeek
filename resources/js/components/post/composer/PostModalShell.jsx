import React from 'react';
import { X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import LoadingOverlay from '@/components/LoadingOverlay';

const PostModalShell = ({
    user,
    title,
    onClose,
    children,
    footer = null,
    showLoader = false,
    loaderMessage = 'Processing...',
}) => {
    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 h-full z-30 bg-[var(--color-dark)]/50 dark:bg-[var(--color-beta)]/60 backdrop-blur-md transition-all duration-300"
            />

            <div className="w-full fixed inset-0 z-40 mx-auto top-1/2 -translate-y-1/2 max-w-[55%] h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-[var(--color-dark_gray)]/30 dark:border-[var(--color-light)]/10 bg-[var(--color-light)] dark:bg-[var(--color-dark)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                {showLoader && <LoadingOverlay message={loaderMessage} />}
                <div className="relative p-6 border-b border-[var(--color-dark_gray)]/20 dark:border-[var(--color-light)]/10 bg-gradient-to-r from-[var(--color-light)]/40 to-transparent dark:from-[var(--color-dark_gray)]/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar
                                    className="w-14 h-14 overflow-hidden ring-2 ring-[var(--color-light)] dark:ring-[var(--color-dark_gray)]"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-good)] rounded-full border-2 border-[var(--color-light)] dark:border-[var(--color-dark)]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[var(--color-beta)] dark:text-[var(--color-light)]">
                                    {user?.name}
                                </h3>
                                <span className="text-sm text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/60 font-medium">
                                    {title}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full hover:bg-[var(--color-light)]/60 dark:hover:bg-[var(--color-dark_gray)] text-[var(--color-beta)] dark:text-[var(--color-light)] transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-5 px-6 py-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-dark_gray)]/40 dark:scrollbar-thumb-[var(--color-light)]/20 scrollbar-track-transparent">
                    {children}
                </div>

                {footer && (
                    <div className="p-6 border-t border-[var(--color-dark_gray)]/20 dark:border-[var(--color-light)]/10 bg-gradient-to-r from-[var(--color-light)]/60 to-transparent dark:from-[var(--color-dark_gray)]/40 backdrop-blur-sm">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

export default PostModalShell;

