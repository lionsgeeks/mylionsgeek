import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useMemo, useState } from 'react';

function PasswordField({ id, label, error, value, onChange, placeholder, show, onToggleShow }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-beta/50">
                {label}
            </Label>
            <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 z-10 text-beta/35">
                    <KeyRound size={14} />
                </span>
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="h-11 bg-white pr-12 pl-9 text-beta select-text placeholder:text-beta/35 focus-visible:border-alpha/60 focus-visible:ring-alpha/20 dark:bg-white"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute right-3 z-10 text-xs font-medium text-beta/45 transition-colors hover:text-beta"
                >
                    {show ? 'Hide' : 'Show'}
                </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function SetOrganisationPassword({ submitUrl, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const form = useForm({
        password: '',
        password_confirmation: '',
    });

    const strength = useMemo(() => {
        const pwd = form.data.password;
        if (!pwd) return { score: 0, label: 'Too weak', color: 'bg-red-500' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-emerald-600'];
        return { score, label: labels[score], color: colors[score] };
    }, [form.data.password]);

    const submit = (event) => {
        event.preventDefault();
        form.post(submitUrl, { preserveScroll: true });
    };

    return (
        <div className="min-h-svh bg-[#f8f8f5]">
            <Head title="Set your password" />
            <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-12">
                <div className="flex items-center gap-4">
                    <AppLogoIcon size={80} color="#212529" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-alpha">Organisation invitation</p>
                        <h1 className="text-2xl font-bold text-beta">Choose a password</h1>
                        <p className="text-sm text-beta/50">
                            Create a password only you know for <span className="font-medium text-beta/70">{email}</span>. This link works once.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-beta/8 bg-white p-7 shadow-sm">
                    <form onSubmit={submit} className="space-y-5" noValidate>
                        <PasswordField
                            id="password"
                            label="Password"
                            error={form.errors.password}
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            placeholder="Choose a strong password"
                            show={showPassword}
                            onToggleShow={() => setShowPassword((value) => !value)}
                        />

                        {form.data.password && (
                            <div className="space-y-2">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-beta/10">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                        style={{ width: `${(strength.score / 5) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-beta/45">Strength: {strength.label}</p>
                            </div>
                        )}

                        <PasswordField
                            id="password_confirmation"
                            label="Confirm password"
                            error={form.errors.password_confirmation}
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            placeholder="Repeat your new password"
                            show={showPasswordConfirmation}
                            onToggleShow={() => setShowPasswordConfirmation((value) => !value)}
                        />

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-11 min-w-44 bg-alpha font-semibold text-beta shadow-none hover:bg-alpha/90 disabled:opacity-60"
                            >
                                {form.processing ? 'Saving…' : 'Save password →'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
