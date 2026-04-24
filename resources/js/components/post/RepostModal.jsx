import InputError from '@/components/input-error';
import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PostModalShell from './composer/PostModalShell';
import PostTextarea from './composer/PostTextarea';

const RepostModal = ({ open, onOpenChange, user, post }) => {
    const [mode, setMode] = useState('choice'); // 'choice' | 'thoughts'

    const interactionPostId = useMemo(() => post?.interaction_post_id ?? post?.repost_of_post_id ?? post?.id, [post]);

    const form = useForm({
        description: '',
    });

    const close = () => {
        form.reset();
        form.clearErrors();
        setMode('choice');
        onOpenChange(false);
    };

    const submit = (description) => {
        if (!interactionPostId || form.processing) return;

        form.setData('description', description ?? '');
        form.post(`/posts/repost/${interactionPostId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                close();
                router.reload({ preserveScroll: true, preserveState: true });
            },
        });
    };

    if (!open) return null;

    return (
        <PostModalShell
            user={user}
            title="Repost"
            onClose={close}
            showLoader={form.processing}
            loaderMessage="Reposting..."
            footer={
                mode === 'thoughts' ? (
                    <div className="flex w-full items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => setMode('choice')}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-beta)] transition hover:bg-[var(--color-dark_gray)]/10 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-light)]/10"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={() => submit(form.data.description)}
                            className="rounded-xl bg-[var(--color-alpha)] px-8 py-3 text-sm font-bold text-[var(--color-beta)] shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {form.processing ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={() => submit('')}
                            className="rounded-xl border border-[var(--color-dark_gray)]/30 bg-transparent px-6 py-3 text-sm font-semibold text-[var(--color-beta)] transition hover:bg-[var(--color-dark_gray)]/10 dark:border-[var(--color-light)]/10 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-light)]/10"
                        >
                            Repost
                        </button>
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={() => setMode('thoughts')}
                            className="rounded-xl bg-[var(--color-alpha)] px-6 py-3 text-sm font-bold text-[var(--color-beta)] shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Repost with thoughts
                        </button>
                    </div>
                )
            }
        >
            {mode === 'thoughts' ? (
                <>
                    <PostTextarea
                        id="repost-thoughts-textarea"
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        placeholder="Add your thoughts..."
                        disabled={form.processing}
                    />
                    <InputError message={form.errors.description} />
                </>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-dark_gray)] dark:text-[var(--color-light)]/70">
                        Choose how you want to repost this.
                    </p>
                </div>
            )}
        </PostModalShell>
    );
};

export default RepostModal;

