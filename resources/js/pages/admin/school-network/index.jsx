import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';

const IP_FIELDS = [
    ['Network IP 1', '203.0.113.10'],
    ['Network IP 2', '203.0.113.11'],
    ['Network IP 3', '203.0.113.12'],
];

export default function SchoolNetworkIndex({ schoolNetwork }) {
    const { flash } = usePage().props;
    const form = useForm({
        ips: [0, 1, 2].map((index) => schoolNetwork?.ips?.[index] ?? ''),
    });

    const save = (event) => {
        event.preventDefault();
        form.post('/admin/school-network', { preserveScroll: true });
    };

    const activeIps = schoolNetwork?.activeIps ?? [];
    const activeLabel = activeIps.length > 0 ? activeIps.join(', ') : '';
    const usingSaved = schoolNetwork?.source === 'saved';

    return (
        <div className="p-6">
            <Head title="School network" />
            <h1 className="text-2xl font-bold text-dark dark:text-light">School network</h1>
            <p className="mt-1 max-w-2xl text-sm text-dark/60 dark:text-light/60">
                Each morning, enter the three public IPs of the school network. They are saved as one list and replace
                yesterday&apos;s addresses. Student check-in accepts any one of them.
            </p>

            {flash?.success && (
                <p className="mt-4 rounded-lg border border-good/30 bg-good/10 px-4 py-2 text-sm text-good">{flash.success}</p>
            )}

            <form onSubmit={save} className="mt-6 max-w-xl space-y-4 rounded-lg border border-alpha/20 p-4">
                <p className="text-sm text-dark/70 dark:text-light/70">
                    {usingSaved
                        ? `Check-in is using the saved IPs${activeLabel ? `: ${activeLabel}` : ''}.`
                        : 'No IPs have been saved yet. Check-in stays closed until you save three addresses.'}
                </p>
                {IP_FIELDS.map(([label, placeholder], index) => {
                    const error = form.errors[`ips.${index}`] || (index === 0 ? form.errors.ips : undefined);
                    const inputId = `school-network-ip-${index + 1}`;
                    const errorId = `${inputId}-error`;

                    return (
                        <div key={inputId}>
                            <Label htmlFor={inputId}>{label}</Label>
                            <Input
                                id={inputId}
                                name={`ips[${index}]`}
                                value={form.data.ips[index]}
                                onChange={(event) => {
                                    const ips = [...form.data.ips];
                                    ips[index] = event.target.value;
                                    form.setData('ips', ips);
                                }}
                                placeholder={placeholder}
                                autoComplete="off"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? errorId : undefined}
                            />
                            {error && (
                                <p id={errorId} className="mt-1 text-sm text-error">
                                    {error}
                                </p>
                            )}
                        </div>
                    );
                })}
                <p className="text-sm text-dark/60 dark:text-light/60">All three addresses are required. Each one must be different.</p>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Saving...' : 'Save network IPs'}
                </Button>
            </form>
        </div>
    );
}

SchoolNetworkIndex.layout = (page) => <AppLayout>{page}</AppLayout>;
