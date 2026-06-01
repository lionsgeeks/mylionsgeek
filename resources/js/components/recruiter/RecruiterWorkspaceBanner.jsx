import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

/**
 * Shows which organisation the recruiter works for and whether they are the owner or a team member.
 */
export default function RecruiterWorkspaceBanner({ className = '' }) {
    const { auth } = usePage().props;
    const recruiting = auth?.recruiting;

    if (!recruiting?.organization_name) {
        return null;
    }

    const isOwner = recruiting.membership_type === 'organisation_account';

    return (
        <div
            className={`flex flex-wrap items-center gap-3 rounded-lg border border-alpha/20 bg-alpha/5 px-4 py-3 dark:border-light/15 dark:bg-alpha/10 ${className}`}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-alpha/15">
                <Building2 className="h-5 w-5 text-alpha" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-beta/60 dark:text-light/60">Workspace</p>
                <p className="truncate text-base font-semibold text-beta dark:text-light">{recruiting.organization_name}</p>
            </div>
            <Badge
                variant="secondary"
                className={
                    isOwner
                        ? 'shrink-0 border border-alpha/40 bg-alpha/20 text-beta dark:text-light'
                        : 'shrink-0 border border-beta/20 bg-white text-beta dark:bg-dark_gray dark:text-light'
                }
            >
                {recruiting.membership_label ?? (isOwner ? 'Organisation owner' : 'Team member')}
            </Badge>
            {!isOwner && recruiting.member_role && recruiting.member_role !== 'employer' && (
                <Badge variant="outline" className="shrink-0 capitalize">
                    {recruiting.member_role}
                </Badge>
            )}
        </div>
    );
}
