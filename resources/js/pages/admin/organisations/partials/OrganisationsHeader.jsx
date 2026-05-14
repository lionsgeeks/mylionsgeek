import StatsCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Building2, Mail, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import InviteOrganisationDialog from './InviteOrganisationDialog';

export default function OrganisationsHeader({ filteredOrganisations }) {
    const [inviteOpen, setInviteOpen] = useState(false);

    const statsData = useMemo(() => {
        const total = filteredOrganisations.length;
        const onboarded = filteredOrganisations.filter((o) => o.onboarding_completed).length;
        const active = filteredOrganisations.filter((o) => o.account_state === 0).length;
        return [
            { title: 'Total organisations', value: total, icon: Building2 },
            { title: 'Onboarded', value: onboarded, icon: UserCheck },
            { title: 'Active accounts', value: active, icon: Mail },
        ];
    }, [filteredOrganisations]);

    return (
        <>
            <StatsCard statsData={statsData} />
            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-7 py-4 text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                    onClick={() => setInviteOpen(true)}
                >
                    Invite organisation
                </Button>
            </div>
            <InviteOrganisationDialog open={inviteOpen} setOpen={setInviteOpen} />
        </>
    );
}
