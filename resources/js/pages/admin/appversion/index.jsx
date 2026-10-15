import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppVersionIndex({ appVersion, modalHistory = [] }) {
    const { flash } = usePage().props;
    const versionForm = useForm({
        version: appVersion?.version ?? '',
        app_store_url: appVersion?.app_store_url ?? '',
        play_store_url: appVersion?.play_store_url ?? '',
    });
    const modalForm = useForm({
        modal_title: '',
        modal_message: '',
        button_label: '',
        button_url: '',
    });

    const saveVersion = (e) => {
        e.preventDefault();
        versionForm.post('/admin/appversion', { preserveScroll: true });
    };

    const saveModal = (e) => {
        e.preventDefault();
        modalForm.post('/admin/appversion/modals', {
            preserveScroll: true,
            onSuccess: () => modalForm.reset(),
        });
    };

    const setModalActive = (row, active) => {
        router.post(
            `/admin/appversion/modals/${row.id}/active`,
            { active },
            { preserveScroll: true },
        );
    };
    const modalHasErrors = Boolean(
        modalForm.errors.modal_title ||
            modalForm.errors.modal_message ||
            modalForm.errors.button_label ||
            modalForm.errors.button_url,
    );
    const [tab, setTab] = useState(modalHasErrors ? 'modal' : 'version');

    return (
        <div className="p-6">
            <Head title="App version" />
            <h1 className="text-2xl font-bold text-dark dark:text-light">App version</h1>
            <p className="mt-1 text-sm text-dark/60 dark:text-light/60">
                The version matches app.json and asks for an update. A saved modal stops the app for maintenance or another reason when you turn it on in the table.
            </p>

            {flash?.success && (
                <p className="mt-4 rounded-lg border border-good/30 bg-good/10 px-4 py-2 text-sm text-good">
                    {flash.success}
                </p>
            )}

            <div className="mt-6 flex gap-1 border-b border-alpha/10" role="tablist">
                {[
                    ['version', 'App version'],
                    ['modal', 'Block the app'],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        className={`rounded-t-lg px-4 py-3 text-sm font-medium transition-all ${
                            tab === value
                                ? 'border-b-2 border-alpha bg-alpha/5 text-alpha'
                                : 'text-neutral-600 hover:bg-alpha/5 hover:text-alpha dark:text-neutral-400'
                        }`}
                        onClick={() => setTab(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'version' && (
            <form onSubmit={saveVersion} className="w-full space-y-4 rounded-b-lg border border-t-0 border-alpha/20 p-4">
                <div>
                    <h2 className="font-semibold text-dark dark:text-light">App version</h2>
                    <p className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Match the version in{' '}
                        <span className="font-mono text-beta dark:text-alpha">lionsgeek-mobile/app.json</span> after both
                        store listings are live. Saving this does not turn a modal on or off.
                    </p>
                </div>
                <div>
                    <Label htmlFor="version">Required app version</Label>
                    <Input
                        id="version"
                        value={versionForm.data.version}
                        onChange={(e) => versionForm.setData('version', e.target.value)}
                        placeholder="1.0.5"
                    />
                    {versionForm.errors.version && <p className="mt-1 text-sm text-error">{versionForm.errors.version}</p>}
                </div>
                <div>
                    <Label htmlFor="app_store_url">App Store URL (iOS)</Label>
                    <Input
                        id="app_store_url"
                        type="url"
                        value={versionForm.data.app_store_url}
                        onChange={(e) => versionForm.setData('app_store_url', e.target.value)}
                        placeholder="https://apps.apple.com/app/id..."
                    />
                    {versionForm.errors.app_store_url && (
                        <p className="mt-1 text-sm text-error">{versionForm.errors.app_store_url}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="play_store_url">Play Store URL (Android)</Label>
                    <Input
                        id="play_store_url"
                        type="url"
                        value={versionForm.data.play_store_url}
                        onChange={(e) => versionForm.setData('play_store_url', e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                    />
                    {versionForm.errors.play_store_url && (
                        <p className="mt-1 text-sm text-error">{versionForm.errors.play_store_url}</p>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={versionForm.processing}
                    className="border border-alpha bg-alpha text-black hover:bg-transparent hover:text-alpha"
                >
                    {versionForm.processing ? 'Saving…' : 'Save version'}
                </Button>
            </form>
            )}

            {tab === 'modal' && (
            <>
            <form onSubmit={saveModal} className="w-full space-y-4 rounded-b-lg border border-t-0 border-alpha/20 p-4">
                <div>
                    <h2 className="font-semibold text-dark dark:text-light">Block the app</h2>
                    <p className="mt-1 text-sm text-dark/60 dark:text-light/60">
                        Save a message for maintenance or another reason. It is added to the history and does not stop the app until you activate it in the table.
                    </p>
                </div>
                <div>
                    <Label htmlFor="modal_title">Title</Label>
                    <Input
                        id="modal_title"
                        value={modalForm.data.modal_title}
                        onChange={(e) => modalForm.setData('modal_title', e.target.value)}
                        placeholder="We'll be back soon"
                        maxLength={80}
                    />
                    {modalForm.errors.modal_title && <p className="mt-1 text-sm text-error">{modalForm.errors.modal_title}</p>}
                </div>
                <div>
                    <Label htmlFor="modal_message">Message</Label>
                    <Textarea
                        id="modal_message"
                        value={modalForm.data.modal_message}
                        onChange={(e) => modalForm.setData('modal_message', e.target.value)}
                        placeholder="The app is paused while training data is updated."
                        maxLength={500}
                    />
                    {modalForm.errors.modal_message && (
                        <p className="mt-1 text-sm text-error">{modalForm.errors.modal_message}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="button_label">Button label</Label>
                    <Input
                        id="button_label"
                        value={modalForm.data.button_label}
                        onChange={(e) => modalForm.setData('button_label', e.target.value)}
                        placeholder="Contact us"
                        maxLength={40}
                    />
                    {modalForm.errors.button_label && (
                        <p className="mt-1 text-sm text-error">{modalForm.errors.button_label}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="button_url">Button link</Label>
                    <Input
                        id="button_url"
                        value={modalForm.data.button_url}
                        onChange={(e) => modalForm.setData('button_url', e.target.value)}
                        placeholder="mailto:pro@lionsgeek.ma"
                    />
                    {modalForm.errors.button_url && <p className="mt-1 text-sm text-error">{modalForm.errors.button_url}</p>}
                </div>
                <Button
                    type="submit"
                    disabled={modalForm.processing}
                    className="border border-alpha bg-alpha text-black hover:bg-transparent hover:text-alpha"
                >
                    {modalForm.processing ? 'Saving…' : 'Save modal'}
                </Button>
            </form>

            <div className="mt-8 w-full">
                <h2 className="text-lg font-semibold text-dark dark:text-light">Modal history</h2>
                <p className="mt-1 text-sm text-dark/60 dark:text-light/60">
                    Activate one modal to stop the app. Deactivate it to let people back in. The app version is unchanged.
                </p>
                <div className="mt-4 w-full overflow-x-auto rounded-lg border border-alpha/20">
                    <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="border-b border-alpha/20 text-dark/60 dark:text-light/60">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Saved</th>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Message</th>
                                <th className="px-4 py-3 font-semibold">Button</th>
                                <th className="px-4 py-3 font-semibold">Block app</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modalHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-dark/60 dark:text-light/60">
                                        No saved modals yet.
                                    </td>
                                </tr>
                            ) : (
                                modalHistory.map((row) => (
                                    <tr key={row.id} className="border-b border-alpha/10 last:border-0">
                                        <td className="whitespace-nowrap px-4 py-3 text-dark dark:text-light">{row.saved_at}</td>
                                        <td className="px-4 py-3 font-medium text-dark dark:text-light">{row.title}</td>
                                        <td className="max-w-md px-4 py-3 text-dark/80 dark:text-light/80">{row.message}</td>
                                        <td className="px-4 py-3 text-dark dark:text-light">
                                            {row.button_label ? `${row.button_label} · ${row.button_url}` : '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setModalActive(row, !row.is_active)}
                                                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                                                    row.is_active
                                                        ? 'bg-dark text-white dark:bg-light dark:text-dark'
                                                        : 'bg-alpha text-black'
                                                }`}
                                            >
                                                {row.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
            )}
        </div>
    );
}

AppVersionIndex.layout = (page) => <AppLayout>{page}</AppLayout>;
