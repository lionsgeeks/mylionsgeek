import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

export default function TwoFactorChallenge({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/two-factor/login');
    };

    return (
        <AuthLayout title="Two Factor Authentication" description="Enter the 6-digit code from your authenticator app">
            <Head title="Two Factor Authentication" />

            <div className="flex min-h-full flex-col justify-center py-14 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl">Enter Authentication Code</CardTitle>
                            <CardDescription className="text-base">Open your authenticator app and enter the 6‑digit code</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="code" className="text-base">
                                        Authentication Code
                                    </Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength="6"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="mt-2 block h-12 w-full text-center text-2xl tracking-[0.35em]"
                                        placeholder="000000"
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    {errors.code && <p className="mt-2 text-base text-red-600">{errors.code}</p>}
                                </div>

                                <div>
                                    <Button type="submit" disabled={processing || data.code.length !== 6} className="h-12 w-full text-base">
                                        {processing ? 'Verifying...' : 'Verify Code'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}
