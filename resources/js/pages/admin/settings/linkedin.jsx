import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

export default function LinkedInSettings({ linkedin, redirect_uri }) {
    const { data, setData, post, processing, errors } = useForm({
        client_id: linkedin?.client_id ?? '',
        client_secret: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings/linkedin', { preserveScroll: true });
    };

    return (
        <div className="p-6">
            <Head title="LinkedIn Settings" />
            <h1 className="text-2xl font-bold text-dark dark:text-light">LinkedIn Settings</h1>
            <p className="mt-1 text-sm text-dark/60 dark:text-light/60">Configure LinkedIn OAuth once to enable “post certificate to LinkedIn”.</p>

            <div className="mt-4 rounded-lg border border-alpha/20 bg-light p-4 dark:bg-dark">
                <div className="text-sm font-semibold">Redirect URI</div>
                <div className="mt-1 rounded-md border border-alpha/15 bg-alpha/5 p-3 text-xs break-all text-dark/70 dark:text-light/70">
                    {redirect_uri}
                </div>
                <p className="mt-2 text-xs text-dark/60 dark:text-light/60">Add this exact URL to your LinkedIn app’s Authorized Redirect URLs.</p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="client_id">Client ID</Label>
                    <Input id="client_id" value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} />
                    {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                </div>

                <div>
                    <Label htmlFor="client_secret">Client Secret</Label>
                    <Input
                        id="client_secret"
                        type="password"
                        value={data.client_secret}
                        onChange={(e) => setData('client_secret', e.target.value)}
                        placeholder={linkedin?.has_client_secret ? 'Saved (leave empty to keep current)' : 'Enter client secret'}
                    />
                    {errors.client_secret && <p className="mt-1 text-sm text-red-600">{errors.client_secret}</p>}
                    <p className="mt-1 text-xs text-dark/60 dark:text-light/60">We never show the saved secret again.</p>
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                >
                    {processing ? 'Saving…' : 'Save'}
                </Button>
            </form>
        </div>
    );
}

LinkedInSettings.layout = (page) => <AppLayout>{page}</AppLayout>;
