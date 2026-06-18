import { Button } from '@/components/ui/button';
// import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';

export default function NotFound({ message }) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-12 text-center text-foreground">
            <Head title="Not found" />
            <p className="text-6xl font-bold text-muted-foreground tabular-nums">404</p>
            <div className="max-w-md space-y-2">
                <h1 className="text-xl font-semibold">Page not found</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Go back
                </Button>
                <Button asChild variant="default">
                    <Link href='/'>Home</Link>
                </Button>
            </div>
        </div>
    );
}
