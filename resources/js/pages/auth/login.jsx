import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import AuthLayout from '@/layouts/auth-layout';
// import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';


export default function Login({ status, canResetPassword }) {
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const handleCustomErrors = (responseErrors) => {
        if (responseErrors.email) {
            //alert("h")
        }
    };
    return (
        <AuthSplitLayout title="Welcome" description="Please enter your information">
            <Head title="Log in" />

            <Form {...AuthenticatedSessionController.store.form()} onError={handleCustomErrors} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors, setErrors }) => {
                    // Handle the case where the server returns a custom error

                    return (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        {canResetPassword && (
                                            <TextLink href={request()} className="ml-auto text-sm text-[var(--color-alpha)]" tabIndex={5}>
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className='relative'>
                                        <Input
                                            id="password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox id="remember" name="remember" tabIndex={3} />
                                    <Label htmlFor="remember">Remember me</Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full bg-neutral-900 text-white hover:bg-black dark:bg-[var(--color-alpha)] dark:text-black dark:hover:brightness-95"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Log in
                                </Button>
                            </div>

                            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                        </>
                    );
                }}
            </Form>
        </AuthSplitLayout>
    );
}   