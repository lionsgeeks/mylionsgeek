import { X } from 'lucide-react';
import { useEffect } from 'react';
import { helpers } from './utils/helpers';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';

const CreateSocialLinkModal = ({ onOpen, onOpenChange, initialLink = null }) => {
    const { stopScrolling } = helpers();

    const isEdit = Boolean(initialLink?.id);

    const { data, setData, processing, errors, reset, clearErrors, post, put } = useForm({
        title: initialLink?.title || '',
        url: initialLink?.url || '',
    });

    useEffect(() => {
        stopScrolling(onOpen);
        return () => stopScrolling(false);
    }, [onOpen]);

    useEffect(() => {
        if (!onOpen) return;

        clearErrors();
        setData({
            title: initialLink?.title || '',
            url: initialLink?.url || '',
        });

        return () => {
            reset();
            clearErrors();
        };
    }, [onOpen, initialLink?.id]);

    const submit = () => {
        if (isEdit) {
            put(`/users/social-links/${initialLink.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                    clearErrors();
                },
            });
            return;
        }

        post('/users/social-links', {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                clearErrors();
            },
        });
    };

    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" />
            <div className="fixed inset-0 h-fit mx-auto w-[70%] sm:w-[520px] bg-light dark:bg-beta rounded-lg top-1/2 -translate-y-1/2 z-50 overflow-hidden flex flex-col">
                <div className="bg-light dark:bg-dark w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-light dark:bg-dark border-b border-beta/20 dark:border-light/10 p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-beta dark:text-light">
                            {isEdit ? 'Edit link' : 'Add link'}
                        </h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-beta/60 dark:text-light/60 hover:text-beta dark:hover:text-light transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                Title*
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ex: GitHub, Portfolio, Instagram"
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-beta dark:text-light mb-2">
                                URL*
                            </label>
                            <input
                                type="url"
                                name="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-light dark:bg-dark_gray border border-beta/30 dark:border-light/20 rounded text-beta dark:text-light placeholder:text-beta/50 dark:placeholder:text-light/50 focus:outline-none focus:border-alpha focus:ring-1 focus:ring-alpha"
                            />
                            <InputError message={errors.url} className="mt-1" />
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-light dark:bg-dark border-t border-beta/20 dark:border-light/10 p-4 flex justify-end gap-3">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="px-6 py-2 border border-beta/30 dark:border-light/30 text-beta dark:text-light rounded-full font-medium hover:bg-beta/5 dark:hover:bg-light/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="px-6 py-2 bg-alpha text-beta dark:text-dark rounded-full font-medium hover:bg-alpha/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateSocialLinkModal;
