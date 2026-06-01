import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';
import OrganisationTeamTable from './partials/OrganisationTeamTable';

export default function AdminOrganisationShow({ organization, teamMembers }) {
    const { flash } = usePage().props;
    const org = organization ?? {};
    const displayName = org.display_name || org.enterprise_name || org.email || 'Organisation';

    return (
        <AppLayout>
            <Head title={`${displayName} — Team`} />
            <div className="flex flex-col gap-8 p-6">
                <Link
                    href="/admin/organisations"
                    className="inline-flex w-fit items-center gap-1 text-sm text-alpha hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to organisations
                </Link>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-alpha/15">
                            <Building2 className="h-6 w-6 text-alpha" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-beta dark:text-light">{displayName}</h1>
                            <p className="mt-1 text-sm text-beta/70 dark:text-light/70">{org.email}</p>
                            {org.contact_name && (
                                <p className="mt-0.5 text-sm text-beta/60 dark:text-light/60">Contact: {org.contact_name}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={org.onboarding_completed ? 'bg-alpha/20 text-black' : ''}>
                            {org.onboarding_completed ? 'Onboarding complete' : 'Onboarding pending'}
                        </Badge>
                        <Badge variant="secondary">
                            {teamMembers?.length ?? 0} team member{(teamMembers?.length ?? 0) === 1 ? '' : 's'}
                        </Badge>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-beta dark:text-light">Team</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Organisation owner and invited employers. Suspend or activate each account individually.
                        </p>
                    </div>
                    <OrganisationTeamTable teamMembers={teamMembers} />
                </div>
            </div>
        </AppLayout>
    );
}
