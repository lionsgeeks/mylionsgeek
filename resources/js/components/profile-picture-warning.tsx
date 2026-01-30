import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function ProfilePictureWarning() {
    const page = usePage();
    const { auth, session } = page.props as {
        auth: { user?: { id: string; name: string; avatarUrl?: string | null; isProfileImageMissing?: boolean } };
        session: { id: string };
    };

    const userId = auth?.user?.id;
    const isMissing = !!auth?.user && !!auth?.user?.isProfileImageMissing;

    const cookieKey = useMemo(() => (userId && session?.id ? `dismiss_profile_image_warning_${userId}_${session.id}` : null), [userId, session?.id]);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!cookieKey || !isMissing) {
            setOpen(false);
            return;
        }
        const dismissed = document.cookie.split('; ').find((row) => row.startsWith(`${cookieKey}=`));
        setOpen(!dismissed);
    }, [cookieKey, isMissing]);

    const handleDismiss = (days = 7) => {
        if (!cookieKey) return;
        const expires = new Date();
        expires.setDate(expires.getDate() + days);
        document.cookie = `${cookieKey}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        setOpen(false);
    };

    const currentUrl = (page as unknown as { url?: string })?.url;
    if (!auth?.user || !isMissing) return null;
    if (currentUrl && currentUrl.startsWith('/settings/profile')) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete your profile</DialogTitle>
                    <DialogDescription>
                        Your profile picture is missing. Adding one helps others recognize you and completes your profile.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button asChild>
                        <Link href="/settings/profile" onClick={() => setOpen(false)}>
                            Upload now
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDismiss(7)}>
                        Skip for now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
