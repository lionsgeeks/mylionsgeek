import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const StatusBadge = ({ yes, trueText, falseText }) => (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${yes ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
        {yes ? trueText : falseText}
    </span>
);

const ReservationsIndex = ({ reservations = [], coworkReservations = [], studioReservations = [] }) => {
    const [tab, setTab] = useState('all');
    const [loadingAction, setLoadingAction] = useState({ id: null, type: null });

    const total = useMemo(() => ({
        reservations: reservations.length,
        coworks: coworkReservations.length,
        studios: studioReservations.length,
    }), [reservations, coworkReservations, studioReservations]);

    return (
        <AppLayout>
            <Head title="Reservations" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Reservations</h1>
                        <p className="text-sm text-muted-foreground">{total.reservations} base, {total.coworks} coworks, {total.studios} studios</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={tab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTab('all')} className={tab === 'all' ? 'bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]' : ''}>All reservations</Button>
                    <Button variant={tab === 'coworks' ? 'default' : 'outline'} size="sm" onClick={() => setTab('coworks')} className={tab === 'coworks' ? 'bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]' : ''}>Cowork reservations</Button>
                    <Button variant={tab === 'studios' ? 'default' : 'outline'} size="sm" onClick={() => setTab('studios')} className={tab === 'studios' ? 'bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]' : ''}>Studio reservations</Button>
                </div>

                {tab === 'all' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-full table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-24" />
                                    <col className="w-24" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    {/* <col className="w-28" /> */}
                                    <col className="w-28" />
                                    <col className="w-40" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Start</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">End</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Approved</th>
                                        {/* <th className="px-4 py-3 text-left text-sm font-medium">Team</th> */}
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {reservations.map((r) => (
                                        <tr key={r.id} className="hover:bg-accent/30">
                                        <td className="px-4 py-3 text-sm truncate">{r.user_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.date}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.start}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.end}</td>
                                        <td className="px-4 py-3 text-sm capitalize">{(r.type || r.place_type)?.replace('_',' ') ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm"><StatusBadge yes={!!r.approved} trueText="Approved" falseText="Pending" /></td>
                                        {/* <td className="px-4 py-3 text-sm truncate">{r.team_name ? `${r.team_name}${r.team_members ? ` — ${r.team_members}` : ''}` : '—'}</td> */}
                                        <td className="py-3 text-sm">
                                                {r.canceled ? <Badge variant="destructive">Canceled</Badge> : r.passed ? <Badge>Passed</Badge> : <Badge className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)]">Active</Badge>}
                                            </td>
                                        <td className="py-3 text-right text-sm">
                                                {!r.approved && !r.canceled && (
                                                <div className="inline-flex gap-2 justify-end w-full">
                                                        <Button
                                                            size="sm"
                                                        className="h-7 px-2 cursor-pointer bg-green-500 text-white hover:bg-green-600"
                                                            disabled={loadingAction.id === r.id}
                                                            onClick={() => {
                                                                setLoadingAction({ id: r.id, type: 'approve' });
                                                                router.post(`/admin/reservations/${r.id}/approve`, {}, {
                                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                                });
                                                            }}
                                                        >
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                        className="h-7 px-2 cursor-pointer"
                                                            disabled={loadingAction.id === r.id}
                                                            onClick={() => {
                                                                if (!window.confirm('Cancel this reservation?')) return;
                                                                setLoadingAction({ id: r.id, type: 'cancel' });
                                                                router.post(`/admin/reservations/${r.id}/cancel`, {}, {
                                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                                });
                                                            }}
                                                        >
                                                        <X className="h-4 w-4 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {reservations.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No reservations yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'coworks' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-full divide-y divide-sidebar-border/70">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Table</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Day</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Start</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">End</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {coworkReservations.map((rc) => (
                                        <tr key={rc.id} className="hover:bg-accent/30">
                                            <td className="px-4 py-3 text-sm">{rc.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{rc.table}</td>
                                            <td className="px-4 py-3 text-sm">{rc.day}</td>
                                            <td className="px-4 py-3 text-sm">{rc.start}</td>
                                            <td className="px-4 py-3 text-sm">{rc.end}</td>
                                            <td className="px-4 py-3 text-sm"><StatusBadge yes={!!rc.approved} trueText="Approved" falseText="Pending" /></td>
                                        </tr>
                                    ))}
                                    {coworkReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No cowork reservations yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'studios' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-full divide-y divide-sidebar-border/70">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Studio</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Day</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Start</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">End</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {studioReservations.map((r) => (
                                        <tr key={r.id} className="hover:bg-accent/30">
                                            <td className="px-4 py-3 text-sm">{r.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{r.studio_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{r.day ?? r.date}</td>
                                            <td className="px-4 py-3 text-sm">{r.start}</td>
                                            <td className="px-4 py-3 text-sm">{r.end}</td>
                                            <td className="px-4 py-3 text-sm">{r.team_members ?? '—'}</td>
                                        </tr>
                                    ))}
                                    {studioReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No studio reservations yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default ReservationsIndex;


