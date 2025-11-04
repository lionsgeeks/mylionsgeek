import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/password';

const breadcrumbs = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwd, setPwd] = useState('');

    const strength = useMemo(() => {
        if (!pwd) return { score: 0, label: 'Too weak', color: 'bg-red-500' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-blue-500','bg-green-500','bg-emerald-600'];
        return { score, label: labels[score], color: colors[score] };
    }, [pwd]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={['password', 'password_confirmation', 'current_password']}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Current password</Label>

                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type={showCurrent ? 'text' : 'password'}
                                            className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] pr-12"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                        />
                                        <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200">
                                            {showCurrent ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">New password</Label>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type={showNew ? 'text' : 'password'}
                                            className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] pr-12"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                            onChange={(e) => setPwd(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200">
                                            {showNew ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
                                            <div 
                                                className={`h-2 rounded transition-all duration-300 ${strength.color}`} 
                                                style={{ width: `${(strength.score/5)*100}%` }} 
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                            Strength: <span className="font-semibold">{strength.label}</span>
                                        </div>
                                        <ul className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 list-disc pl-5 space-y-1">
                                            <li>At least 8 characters</li>
                                            <li>Use upper and lower case letters</li>
                                            <li>Include numbers and symbols</li>
                                        </ul>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>

                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] pr-12"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200">
                                            {showConfirm ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button 
                                        disabled={processing} 
                                        data-test="update-password-button" 
                                        className='px-12 py-5 rounded-full bg-[#FFC801] hover:bg-[#e6b401] text-neutral-900 font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {processing ? 'Saving...' : 'Save password'}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-300 transform"
                                        enterFrom="opacity-0 scale-95 translate-x-4"
                                        enterTo="opacity-100 scale-100 translate-x-0"
                                        leave="transition ease-in-out duration-500"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2.5 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                                            <svg 
                                                className="w-5 h-5 flex-shrink-0" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2.5} 
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                                                />
                                            </svg>
                                            <span className="font-medium">Password updated successfully!</span>
                                        </div>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}