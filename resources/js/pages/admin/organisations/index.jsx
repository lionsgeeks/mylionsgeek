import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import students from '../../../../../public/assets/images/banner/students.png';
import OrganisationsFilter from './partials/OrganisationsFilter';
import OrganisationsHeader from './partials/OrganisationsHeader';
import OrganisationsTable from './partials/OrganisationsTable';

export default function AdminOrganisationsIndex({ organisations }) {
    const { auth, flash } = usePage().props;
    const [search, setSearch] = useState('');

    const filteredOrganisations = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return organisations;
        return organisations.filter((org) => {
            return (
                (org.email || '').toLowerCase().includes(q) ||
                (org.enterprise_name || '').toLowerCase().includes(q) ||
                (org.contact_name || '').toLowerCase().includes(q)
            );
        });
    }, [organisations, search]);

    return (
        <AppLayout>
            <div className="flex flex-col gap-10 p-6">
                <Banner
                    illustration={students}
                    userName={auth?.user?.name ?? ''}
                    title="Organisations"
                    description="Invite hiring partners by email. They complete their company profile after first login."
                />

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                        {flash.success}
                    </div>
                )}

                <OrganisationsHeader filteredOrganisations={organisations} />
                <OrganisationsFilter search={search} setSearch={setSearch} />
                <OrganisationsTable organisations={filteredOrganisations} />
            </div>
        </AppLayout>
    );
}
