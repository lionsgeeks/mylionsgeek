import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { useInitials } from '@/hooks/use-initials';
import { Avatar,  } from '@/components/ui/avatar';

const breadcrumbs = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile" description="Update your information and account preferences" />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Avatar + Basic info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                            <Avatar className="h-24 w-24 overflow-hidden rounded-full" image={auth.user.image} name={auth.user.name} lastActivity={auth.user.last_activity || null} onlineCircleClass="w-6 h-6" />

                                            <div className="w-full">
                                                <Label htmlFor="image">Avatar</Label>
                                                <Input id="image" name="image" type="file" accept="image/*" className="mt-1 block w-full" />
                                                <InputError className="mt-2" message={errors.image} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                            />
                                            <InputError className="mt-2" message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />
                                            <InputError className="mt-2" message={errors.email} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input id="phone" name="phone" defaultValue={auth.user.phone || ''} placeholder="e.g. +212 600 000 000" />
                                                <InputError className="mt-2" message={errors.phone} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cin">CIN</Label>
                                                <Input id="cin" name="cin" defaultValue={auth.user.cin || ''} placeholder="National ID" />
                                                <InputError className="mt-2" message={errors.cin} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Integrations / WakaTime */}
                                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="wakatime_api_key">WakaTime API Key</Label>
                                        <Input id="wakatime_api_key" name="wakatime_api_key" defaultValue={auth.user.wakatime_api_key || ''} placeholder="Enter your WakaTime API key" />
                                        <InputError className="mt-2" message={errors.wakatime_api_key} />
                                        <p className="text-xs text-neutral-500">Used to compute your coding leaderboard stats.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} data-test="update-profile-button" className='px-12 py-5 rounded-full hover:bg-[#FFC801] transition-all cursor-pointer dark:hover:text-[#FAFAFA]'>Save</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
