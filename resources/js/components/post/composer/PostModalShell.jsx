import LoadingOverlay from '@/components/LoadingOverlay';
import { Avatar } from '@/components/ui/avatar';
import { X } from 'lucide-react';

const PostModalShell = ({ user, title, onClose, children, footer = null, showLoader = false, loaderMessage = 'Processing...' }) => {
    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 z-30 h-full bg-[var(--color-dark)]/50 backdrop-blur-md transition-all duration-300 dark:bg-[var(--color-beta)]/60"
            />

            <div className="fixed inset-0 top-1/2 z-40 mx-auto flex h-[85vh] w-full max-w-[55%] -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-[var(--color-dark_gray)]/30 bg-[var(--color-light)] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 dark:border-[var(--color-light)]/10 dark:bg-[var(--color-dark)]">
                {showLoader && <LoadingOverlay message={loaderMessage} />}
                <div className="relative border-b border-[var(--color-dark_gray)]/20 bg-gradient-to-r from-[var(--color-light)]/40 to-transparent p-6 dark:border-[var(--color-light)]/10 dark:from-[var(--color-dark_gray)]/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar
                                    className="h-14 w-14 overflow-hidden ring-2 ring-[var(--color-light)] dark:ring-[var(--color-dark_gray)]"
                                    image={user?.image}
                                    name={user?.name}
                                    lastActivity={user?.last_online || null}
                                    onlineCircleClass="hidden"
                                />
                                <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-[var(--color-light)] bg-[var(--color-good)] dark:border-[var(--color-dark)]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-beta)] dark:text-[var(--color-light)]">{user?.name}</h3>
                                <span className="text-sm font-medium text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/60">{title}</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-full p-2.5 text-[var(--color-beta)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-light)]/60 active:scale-95 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-dark_gray)]"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="scrollbar-thin scrollbar-thumb-[var(--color-dark_gray)]/40 dark:scrollbar-thumb-[var(--color-light)]/20 scrollbar-track-transparent flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-[var(--color-dark_gray)]/20 bg-gradient-to-r from-[var(--color-light)]/60 to-transparent p-6 backdrop-blur-sm dark:border-[var(--color-light)]/10 dark:from-[var(--color-dark_gray)]/40">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

export default PostModalShell;
