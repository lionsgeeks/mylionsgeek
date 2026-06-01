import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function JobsPageHeader() {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-beta dark:text-light">Jobs</h1>
                <p className="mt-1 text-sm text-beta/70 dark:text-light/70">Open roles from the community. Filters update from live listings.</p>
            </div>
            <Button variant="outline" size="sm" className="border-alpha/30 text-alpha" asChild>
                <Link href="/students/jobs/applications/mine">My applications</Link>
            </Button>
        </div>
    );
}
