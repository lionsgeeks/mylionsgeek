import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Copy, Download, Key, Shield, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TwoFactorAuthSection() {
    const { auth } = usePage().props;
    const [enabled, setEnabled] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Check if 2FA is enabled and confirmed
        if (auth?.user) {
            setEnabled(!!auth.user.has_two_factor_authentication);
            setConfirmed(!!auth.user.has_confirmed_two_factor_authentication);
        }
    }, [auth?.user]);

    const enable2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await axios.post('/api/two-factor-authentication', {}, csrf ? { headers: { 'X-CSRF-TOKEN': csrf } } : undefined);
            setEnabled(true);
            setConfirmed(false);
            setRecoveryCodes(response.data.recovery_codes);
            setShowRecoveryCodes(true);
            setSuccess('Two-factor authentication has been enabled. Please scan the QR code and confirm setup.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enable two-factor authentication');
        } finally {
            setLoading(false);
        }
    };

    const getQrCode = async () => {
        try {
            const response = await axios.get('/api/two-factor-qr-code');
            setQrCode(response.data.svg);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get QR code');
        }
    };

    const confirm2FA = async () => {
        if (!confirmationCode || confirmationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await axios.post('/api/two-factor-confirm', { code: confirmationCode }, csrf ? { headers: { 'X-CSRF-TOKEN': csrf } } : undefined);
            setConfirmed(true);
            setConfirmationCode('');
            setSuccess('Two-factor authentication has been confirmed and is now active!');
            // Refresh the page to get updated user data
            router.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid confirmation code');
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await axios.delete('/api/two-factor-authentication', csrf ? { headers: { 'X-CSRF-TOKEN': csrf } } : undefined);
            setEnabled(false);
            setConfirmed(false);
            setQrCode('');
            setRecoveryCodes([]);
            setShowRecoveryCodes(false);
            setSuccess('Two-factor authentication has been disabled');
            // Refresh the page to get updated user data
            router.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable two-factor authentication');
        } finally {
            setLoading(false);
        }
    };

    const regenerateRecoveryCodes = async () => {
        setLoading(true);
        setError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await axios.post('/api/two-factor-recovery-codes', {}, csrf ? { headers: { 'X-CSRF-TOKEN': csrf } } : undefined);
            setRecoveryCodes(response.data.recovery_codes);
            setSuccess('Recovery codes have been regenerated');
            // Immediately show the dialog so the user can save them
            setShowRecoveryCodes(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to regenerate recovery codes');
        } finally {
            setLoading(false);
        }
    };

    const copyRecoveryCodes = () => {
        const codesText = recoveryCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setSuccess('Recovery codes copied to clipboard');
    };

    const downloadRecoveryCodes = () => {
        const codesText = recoveryCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccess('Recovery codes downloaded');
    };

    return (
        <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[var(--color-alpha)]" />
                    <CardTitle>Two-Factor Authentication</CardTitle>
                </div>
                <CardDescription className="mt-1">
                    Add an extra layer of security to your account by enabling two‑factor authentication.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {!enabled ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Smartphone className="h-4 w-4" />
                            <span>Use an authenticator app like Google Authenticator or Authy</span>
                        </div>
                        <Button onClick={enable2FA} disabled={loading} className="w-full">
                            {loading ? 'Enabling...' : 'Enable Two-Factor Authentication'}
                        </Button>
                    </div>
                ) : enabled && !confirmed ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Two-factor authentication is enabled but not confirmed</span>
                        </div>
                        <Button onClick={getQrCode} variant="outline" size="sm">
                            Show QR Code
                        </Button>
                        {qrCode && (
                            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                                <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900" dangerouslySetInnerHTML={{ __html: qrCode }} />
                                <div className="w-full max-w-sm space-y-2">
                                    <Label htmlFor="confirmation-code">Confirmation Code</Label>
                                    <Input
                                        id="confirmation-code"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={confirmationCode}
                                        onChange={(e) => setConfirmationCode(e.target.value)}
                                        maxLength={6}
                                        className="text-center tracking-widest"
                                    />
                                    <Button onClick={confirm2FA} disabled={loading || confirmationCode.length !== 6} className="w-full">
                                        {loading ? 'Confirming...' : 'Confirm Setup'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Two-factor authentication is {confirmed ? 'enabled and confirmed' : 'enabled but not confirmed'}</span>
                        </div>

                        {confirmed && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={() => setShowRecoveryCodes(true)}
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-[var(--color-alpha)] hover:text-black"
                                    >
                                        Show Recovery Codes
                                    </Button>
                                    <Button
                                        onClick={regenerateRecoveryCodes}
                                        variant="outline"
                                        size="sm"
                                        disabled={loading}
                                        className="hover:bg-[var(--color-alpha)] hover:text-black"
                                    >
                                        {loading ? 'Regenerating...' : 'Regenerate Recovery Codes'}
                                    </Button>
                                    <Button onClick={disable2FA} variant="destructive" size="sm" disabled={loading}>
                                        {loading ? 'Disabling...' : 'Disable 2FA'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recovery Codes Dialog */}
                <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Recovery Codes
                            </DialogTitle>
                            <DialogDescription>Store these recovery codes in a safe place. Each code can only be used once.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                {recoveryCodes.map((code, index) => (
                                    <div key={index} className="font-mono text-sm">
                                        {code}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={copyRecoveryCodes} variant="outline" size="sm" className="flex-1">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                </Button>
                                <Button onClick={downloadRecoveryCodes} variant="outline" size="sm" className="flex-1">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowRecoveryCodes(false)}>I've Saved These Codes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
