import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function AppVersionIndex({ appVersion }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        version: appVersion?.version ?? '',
        app_store_url: appVersion?.app_store_url ?? '',
        play_store_url: appVersion?.play_store_url ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/appversion', { preserveScroll: true });
    };

    return (
        <div className="p-6">
            <Head title="App version" />
            <h1 className="text-2xl font-bold text-dark dark:text-light">App version</h1>
            <p className="mt-1 text-sm text-dark/60 dark:text-light/60">
                Set the required mobile app version. Users on an older build see a forced update screen.
            </p>

            {flash?.success && (
                <p className="mt-4 rounded-lg border border-good/30 bg-good/10 px-4 py-2 text-sm text-good">
                    {flash.success}
                </p>
            )}

            <div className="mt-4 rounded-lg border border-alpha/20 bg-light p-4 dark:bg-dark">
                <p className="text-sm text-dark/70 dark:text-light/70">
                    Match the version in{' '}
                    <span className="font-mono text-beta dark:text-alpha">lionsgeek-mobile/app.json</span> when you
                    release a new build. Save only after both store listings are live.
                </p>
            </div>

            <form onSubmit={submit} className="mt-6 max-w-xl space-y-4">
                <div>
                    <Label htmlFor="version">Required app version</Label>
                    <Input
                        id="version"
                        value={data.version}
                        onChange={(e) => setData('version', e.target.value)}
                        placeholder="1.0.5"
                    />
                    {errors.version && <p className="mt-1 text-sm text-error">{errors.version}</p>}
                </div>

                <div>
                    <Label htmlFor="app_store_url">App Store URL (iOS)</Label>
                    <Input
                        id="app_store_url"
                        type="url"
                        value={data.app_store_url}
                        onChange={(e) => setData('app_store_url', e.target.value)}
                        placeholder="https://apps.apple.com/app/id..."
                    />
                    {errors.app_store_url && <p className="mt-1 text-sm text-error">{errors.app_store_url}</p>}
                </div>

                <div>
                    <Label htmlFor="play_store_url">Play Store URL (Android)</Label>
                    <Input
                        id="play_store_url"
                        type="url"
                        value={data.play_store_url}
                        onChange={(e) => setData('play_store_url', e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                    />
                    {errors.play_store_url && <p className="mt-1 text-sm text-error">{errors.play_store_url}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="border border-alpha bg-alpha text-black hover:bg-transparent hover:text-alpha"
                >
                    {processing ? 'Saving…' : 'Save'}
                </Button>
            </form>
        </div>
    );
}

AppVersionIndex.layout = (page) => <AppLayout>{page}</AppLayout>;
