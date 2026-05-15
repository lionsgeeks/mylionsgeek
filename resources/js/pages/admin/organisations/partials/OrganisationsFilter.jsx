import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function OrganisationsFilter({ search, setSearch }) {
    return (
        <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or company name…"
                className="border-alpha/30 pl-9 dark:border-light/15"
            />
        </div>
    );
}
