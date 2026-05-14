import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout } from '@/routes';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Globe, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';

const SECTOR_OPTIONS = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media',
    'Other',
];

const STEPS = [
    { number: 1, label: 'About you' },
    { number: 2, label: 'Contact details' },
];

function FieldIcon({ icon: Icon }) {
    return (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-beta/35">
            <Icon size={15} />
        </span>
    );
}

function Field({ id, label, error, icon, children }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-beta/50">
                {label}
            </Label>
            <div className="relative">{children}</div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function OrganisationOnboarding({ organization }) {
    const [step, setStep] = useState(1);
    const form = useForm({
        contact_name: organization?.contact_name ?? '',
        enterprise_name: organization?.enterprise_name ?? '',
        sector: organization?.sector ?? '',
        location: organization?.location ?? '',
        linkedin_url: organization?.linkedin_url ?? '',
        phone: organization?.phone ?? '',
    });

    const canGoNext =
        form.data.contact_name.trim() !== '' && form.data.enterprise_name.trim() !== '' && form.data.sector.trim() !== '';

    const submit = (e) => {
        e.preventDefault();
        form.post('/organisation/onboarding', { preserveScroll: true });
    };

    const inputBase = 'h-11 pl-9 border-beta/15 bg-white focus-visible:ring-alpha focus-visible:border-alpha/50 text-beta placeholder:text-beta/35 transition-colors';
    const selectBase = `${inputBase} w-full rounded-md border px-9 text-sm appearance-none cursor-pointer`;

    return (
        <div className="min-h-svh bg-[#f8f8f5]">
            <Head title="Complete organisation profile" />

            {/* Top bar */}
            <header className="flex h-16 items-center justify-between border-b border-beta/8 bg-white px-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-alpha">
                        <AppLogoIcon size={18} color="#212529" />
                    </div>
                    <span className="text-sm font-semibold text-beta">LionsGeek</span>
                </div>
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="text-xs font-medium text-beta/50 transition-colors hover:text-beta"
                >
                    Sign out
                </Link>
            </header>

            <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-12">
                {/* Progress header */}
                <div className="space-y-5">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-alpha">
                            Step {step} of {STEPS.length}
                        </p>
                        <h1 className="text-2xl font-bold text-beta">
                            {step === 1 ? 'Tell us about your company' : 'How can we reach you?'}
                        </h1>
                        <p className="text-sm text-beta/55">
                            Signed in as <span className="font-medium text-beta/75">{organization?.email}</span>
                        </p>
                    </div>

                    {/* Step progress bar */}
                    <div className="flex gap-2">
                        {STEPS.map((s) => (
                            <div key={s.number} className="flex flex-1 flex-col gap-1.5">
                                <div
                                    className={`h-1 rounded-full transition-all duration-500 ${
                                        s.number <= step ? 'bg-alpha' : 'bg-beta/12'
                                    }`}
                                />
                                <span className={`text-[11px] font-medium ${s.number <= step ? 'text-alpha' : 'text-beta/35'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form card */}
                <div className="rounded-2xl border border-beta/8 bg-white p-7 shadow-sm">
                    <form onSubmit={submit}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22 }}
                                    className="space-y-5"
                                >
                                    <Field id="contact_name" label="Contact name" error={form.errors.contact_name}>
                                        <FieldIcon icon={User} />
                                        <Input
                                            id="contact_name"
                                            value={form.data.contact_name}
                                            onChange={(e) => form.setData('contact_name', e.target.value)}
                                            placeholder="Jane Smith"
                                            className={inputBase}
                                            required
                                        />
                                    </Field>

                                    <Field id="enterprise_name" label="Company name" error={form.errors.enterprise_name}>
                                        <FieldIcon icon={Building2} />
                                        <Input
                                            id="enterprise_name"
                                            value={form.data.enterprise_name}
                                            onChange={(e) => form.setData('enterprise_name', e.target.value)}
                                            placeholder="Acme Corp"
                                            className={inputBase}
                                            required
                                        />
                                    </Field>

                                    <Field id="sector" label="Industry sector" error={form.errors.sector}>
                                        <FieldIcon icon={Building2} />
                                        <select
                                            id="sector"
                                            value={form.data.sector}
                                            onChange={(e) => form.setData('sector', e.target.value)}
                                            className={selectBase}
                                            required
                                        >
                                            <option value="">Select a sector</option>
                                            {SECTOR_OPTIONS.map((sector) => (
                                                <option key={sector} value={sector}>
                                                    {sector}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22 }}
                                    className="space-y-5"
                                >
                                    <Field id="location" label="Office location" error={form.errors.location}>
                                        <FieldIcon icon={MapPin} />
                                        <Input
                                            id="location"
                                            value={form.data.location}
                                            onChange={(e) => form.setData('location', e.target.value)}
                                            placeholder="Casablanca, Morocco"
                                            className={inputBase}
                                            required
                                        />
                                    </Field>

                                    <Field id="linkedin_url" label="LinkedIn URL" error={form.errors.linkedin_url}>
                                        <FieldIcon icon={Globe} />
                                        <Input
                                            id="linkedin_url"
                                            type="url"
                                            value={form.data.linkedin_url}
                                            onChange={(e) => form.setData('linkedin_url', e.target.value)}
                                            placeholder="https://linkedin.com/company/..."
                                            className={inputBase}
                                        />
                                    </Field>

                                    <Field id="phone" label="Phone number" error={form.errors.phone}>
                                        <FieldIcon icon={Phone} />
                                        <Input
                                            id="phone"
                                            value={form.data.phone}
                                            onChange={(e) => form.setData('phone', e.target.value)}
                                            placeholder="+212 6 00 00 00 00"
                                            className={inputBase}
                                            required
                                        />
                                    </Field>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="mt-7 flex items-center justify-between gap-3">
                            {step === 2 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm font-medium text-beta/55 transition-colors hover:text-beta"
                                >
                                    ← Back
                                </button>
                            ) : (
                                <span />
                            )}

                            {step === 1 ? (
                                <Button
                                    type="button"
                                    disabled={!canGoNext}
                                    onClick={() => setStep(2)}
                                    className="h-11 min-w-36 bg-alpha font-semibold text-beta shadow-none hover:bg-alpha/90 disabled:opacity-40"
                                >
                                    Continue →
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-11 min-w-44 bg-alpha font-semibold text-beta shadow-none hover:bg-alpha/90 disabled:opacity-60"
                                >
                                    {form.processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-beta/30 border-t-beta" />
                                            Saving…
                                        </span>
                                    ) : (
                                        'Complete profile →'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer hint */}
                <p className="text-center text-xs text-beta/35">
                    You can update these details later from your organisation settings.
                </p>
            </main>
        </div>
    );
}
