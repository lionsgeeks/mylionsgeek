import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, X, Search, FileText, Download } from 'lucide-react';

const StatusBadge = ({ yes, trueText, falseText }) => (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${yes ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
        {yes ? trueText : falseText}
    </span>
);

const ReservationsIndex = ({ reservations = [], coworkReservations = [], studioReservations = [] }) => {
    const [tab, setTab] = useState('all');
    const [loadingAction, setLoadingAction] = useState({ id: null, type: null });
    const [selected, setSelected] = useState(null);
    const [infoFor, setInfoFor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter reservations based on search term
    const filteredReservations = useMemo(() => {
        if (!searchTerm) return reservations;
        const term = searchTerm.toLowerCase();
        return reservations.filter(r => 
            r.user_name?.toLowerCase().includes(term) ||
            r.title?.toLowerCase().includes(term) ||
            r.description?.toLowerCase().includes(term) ||
            r.type?.toLowerCase().includes(term) ||
            r.place_type?.toLowerCase().includes(term) ||
            r.date?.includes(term)
        );
    }, [reservations, searchTerm]);

    const filteredCoworkReservations = useMemo(() => {
        if (!searchTerm) return coworkReservations;
        const term = searchTerm.toLowerCase();
        return coworkReservations.filter(r => 
            r.user_name?.toLowerCase().includes(term) ||
            r.day?.includes(term) ||
            `table ${r.table}`?.toLowerCase().includes(term)
        );
    }, [coworkReservations, searchTerm]);

    const filteredStudioReservations = useMemo(() => {
        if (!searchTerm) return studioReservations;
        const term = searchTerm.toLowerCase();
        return studioReservations.filter(r => 
            r.user_name?.toLowerCase().includes(term) ||
            r.title?.toLowerCase().includes(term) ||
            r.studio_name?.toLowerCase().includes(term) ||
            r.team_members?.toLowerCase().includes(term) ||
            (r.day || r.date)?.includes(term)
        );
    }, [studioReservations, searchTerm]);

    const total = useMemo(() => ({
        reservations: filteredReservations.length,
        coworks: filteredCoworkReservations.length,
        studios: filteredStudioReservations.length,
    }), [filteredReservations, filteredCoworkReservations, filteredStudioReservations]);

    // Pagination (same UX as Members) per tab
    const [pageAll, setPageAll] = useState(1);
    const [pageCowork, setPageCowork] = useState(1);
    const [pageStudio, setPageStudio] = useState(1);
    const perPage = 10;
    const pagedAll = filteredReservations.slice((pageAll - 1) * perPage, (pageAll - 1) * perPage + perPage);
    const pagedCowork = filteredCoworkReservations.slice((pageCowork - 1) * perPage, (pageCowork - 1) * perPage + perPage);
    const pagedStudio = filteredStudioReservations.slice((pageStudio - 1) * perPage, (pageStudio - 1) * perPage + perPage);
    const totalPagesAll = Math.ceil(filteredReservations.length / perPage) || 1;
    const totalPagesCowork = Math.ceil(filteredCoworkReservations.length / perPage) || 1;
    const totalPagesStudio = Math.ceil(filteredStudioReservations.length / perPage) || 1;
    useEffect(() => { setPageAll(1); }, [filteredReservations]);
    useEffect(() => { setPageCowork(1); }, [filteredCoworkReservations]);
    useEffect(() => { setPageStudio(1); }, [filteredStudioReservations]);

    return (
        <AppLayout>
            <Head title="Reservations" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Reservations</h1>
                        <p className="text-sm text-muted-foreground">{total.reservations} base, {total.coworks} coworks, {total.studios} studios</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search reservations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                        />
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
                                    <col className="w-40" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    <col className="w-40" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Approved</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {pagedAll.map((r) => (
                                        <tr key={r.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => setSelected(r)}>
                                        <td className="px-4 py-3 text-sm truncate">{r.user_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.date}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.start} - {r.end}</td>
                                        <td className="px-4 py-3 text-sm capitalize">{(r.type || r.place_type)?.replace('_',' ') ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {r.canceled ? (
                                                <Badge variant="destructive">Canceled</Badge>
                                            ) : r.approved ? (
                                                <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 text-right text-sm" onClick={(e) => e.stopPropagation()}>
                                            <div className="inline-flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 cursor-pointer"
                                                    onClick={() => setInfoFor(r)}
                                                    title="View team & equipment"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                {r.approved && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                                                        onClick={() => {
                                                            window.open(`/admin/reservations/${r.id}/pdf`, '_blank');
                                                        }}
                                                        title="Download PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!r.canceled && !r.approved && (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-2 cursor-pointer bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                                        disabled={loadingAction.id === r.id}
                                                        onClick={() => {
                                                            setLoadingAction({ id: r.id, type: 'approve' });
                                                            router.post(`/admin/reservations/${r.id}/approve`, {}, {
                                                                onFinish: () => setLoadingAction({ id: null, type: null })
                                                            });
                                                        }}
                                                        title="Approve reservation"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!r.canceled && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 px-2 cursor-pointer disabled:opacity-50"
                                                        disabled={loadingAction.id === r.id}
                                                        onClick={() => {
                                                            const confirmMsg = r.approved ? 
                                                                'Cancel this approved reservation?' : 
                                                                'Cancel this reservation?';
                                                            if (!window.confirm(confirmMsg)) return;
                                                            setLoadingAction({ id: r.id, type: 'cancel' });
                                                            router.post(`/admin/reservations/${r.id}/cancel`, {}, {
                                                                onFinish: () => setLoadingAction({ id: null, type: null })
                                                            });
                                                        }}
                                                        title="Cancel reservation"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        </tr>
                                    ))}
                                    {filteredReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No reservations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex gap-5 mt-6 w-full items-center justify-center">
                                <button disabled={pageAll === 1} onClick={() => setPageAll((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                                <span>Page {pageAll} of {totalPagesAll}</span>
                                <button disabled={pageAll === totalPagesAll} onClick={() => setPageAll((p) => Math.min(totalPagesAll, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'coworks' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-full table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-40" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    <col className="w-28" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Approved</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {pagedCowork.map((rc) => (
                                        <tr key={rc.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => setSelected({
                                            id: rc.id,
                                            user_name: rc.user_name,
                                            date: rc.day,
                                            start: rc.start,
                                            end: rc.end,
                                            type: 'cowork',
                                            approved: !!rc.approved,
                                            title: `Table ${rc.table}`,
                                            description: null,
                                        })}>
                                            <td className="px-4 py-3 text-sm">{rc.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{rc.day}</td>
                                            <td className="px-4 py-3 text-sm">{rc.start} - {rc.end}</td>
                                            <td className="px-4 py-3 text-sm">cowork</td>
                                            <td className="px-4 py-3 text-sm">
                                                {rc.canceled ? (
                                                    <Badge variant="destructive">Canceled</Badge>
                                                ) : rc.approved ? (
                                                    <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCoworkReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No cowork reservations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex gap-5 mt-6 w-full items-center justify-center">
                                <button disabled={pageCowork === 1} onClick={() => setPageCowork((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                                <span>Page {pageCowork} of {totalPagesCowork}</span>
                                <button disabled={pageCowork === totalPagesCowork} onClick={() => setPageCowork((p) => Math.min(totalPagesCowork, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'studios' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-full table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-40" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    <col className="w-28" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Approved</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {pagedStudio.map((sr) => (
                                        <tr key={sr.id} className="hover:bg-accent/30 cursor-pointer" onClick={() => setSelected({
                                            id: sr.id,
                                            user_name: sr.user_name,
                                            date: sr.day ?? sr.date,
                                            start: sr.start,
                                            end: sr.end,
        type: 'studio',
                                            approved: !!sr.approved,
                                            title: sr.title,
                                            studio_name: sr.studio_name,
                                            description: sr.team_members,
                                        })}>
                                            <td className="px-4 py-3 text-sm">{sr.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{sr.day ?? sr.date}</td>
                                            <td className="px-4 py-3 text-sm">{sr.start} - {sr.end}</td>
                                            <td className="px-4 py-3 text-sm">studio</td>
                                            <td className="px-4 py-3 text-sm">
                                                {sr.canceled ? (
                                                    <Badge variant="destructive">Canceled</Badge>
                                                ) : sr.approved ? (
                                                    <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudioReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No studio reservations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex gap-5 mt-6 w-full items-center justify-center">
                                <button disabled={pageStudio === 1} onClick={() => setPageStudio((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                                <span>Page {pageStudio} of {totalPagesStudio}</span>
                                <button disabled={pageStudio === totalPagesStudio} onClick={() => setPageStudio((p) => Math.min(totalPagesStudio, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                            </div>
                        </div>
                    </div>
                )}
                <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                    <DialogContent className="max-w-2xl">
                        {selected && (
                            <div className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle className="text-lg">Reservation details</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">User</div>
                                        <div className="font-medium">{selected.user_name ?? '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Type</div>
                                        <div className="font-medium capitalize">{(selected.type || selected.place_type)?.replace('_',' ') ?? '—'}</div>
                                    </div>
                                    {((selected.type || selected.place_type) === 'studio') && (
                                        <div>
                                            <div className="text-muted-foreground">Studio Name</div>
                                            <div className="font-medium">{selected.studio_name || '—'}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-muted-foreground">Date</div>
                                        <div className="font-medium">{selected.date}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Time</div>
                                        <div className="font-medium">{selected.start} - {selected.end}</div>
                                    </div>
                                    {selected.type !== 'cowork' && (
                                        <>
                                            <div className="col-span-2">
                                                <div className="text-muted-foreground">Title</div>
                                                <div className="font-medium">{selected.title || '—'}</div>
                                            </div>
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground">Description</div>
                                        <div className="font-medium whitespace-pre-wrap break-words">{selected.description || '—'}</div>
                                    </div>

                                        </>
                                    )}
                                    <div>
                                        <div className="text-muted-foreground">Approved</div>
                                        <div><StatusBadge yes={!!selected.approved} trueText="Approved" falseText="Pending" /></div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Status</div>
                                        <div>{selected.canceled ? <Badge variant="destructive">Canceled</Badge> : selected.passed ? <Badge>Passed</Badge> : <Badge className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)]">Active</Badge>}</div>
                                    </div>

                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    {selected.approved && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 px-3 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                                            onClick={() => {
                                                window.open(`/admin/reservations/${selected.id}/pdf`, '_blank');
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-1" /> Download PDF
                                        </Button>
                                    )}
                                    {!selected.approved && !selected.canceled && (
                                        <Button
                                            size="sm"
                                            className="h-8 px-3 cursor-pointer bg-green-500 text-white hover:bg-green-600"
                                            disabled={loadingAction.id === selected.id}
                                            onClick={() => {
                                                setLoadingAction({ id: selected.id, type: 'approve' });
                                                router.post(`/admin/reservations/${selected.id}/approve`, {}, {
                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                });
                                            }}
                                        >
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                    )}
                                    {!selected.canceled && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 px-3 cursor-pointer"
                                            disabled={loadingAction.id === selected.id}
                                            onClick={() => {
                                                const confirmMsg = selected.approved ? 
                                                    'Cancel this approved reservation?' : 
                                                    'Cancel this reservation?';
                                                if (!window.confirm(confirmMsg)) return;
                                                setLoadingAction({ id: selected.id, type: 'cancel' });
                                                router.post(`/admin/reservations/${selected.id}/cancel`, {}, {
                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                });
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Info modal with two columns: Equipments and Teams */}
                <Dialog open={!!infoFor} onOpenChange={() => setInfoFor(null)}>
                    <DialogContent className="max-w-3xl">
                        {infoFor && (
                            <InfoModalContent reservationId={infoFor.id} initial={infoFor} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default ReservationsIndex;


function InfoModalContent({ reservationId, initial }) {
    const [data, setData] = React.useState({ loading: true, team_name: initial.team_name, team_members: initial.team_members, equipments: initial.equipments });

    React.useEffect(() => {
        let aborted = false;
        async function load() {
            try {
                const res = await fetch(`/admin/reservations/${reservationId}/info`, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
                const body = await res.json();
                if (!aborted) {
                    setData({ loading: false, team_name: body.team_name ?? null, team_members: Array.isArray(body.team_members) ? body.team_members : [], equipments: Array.isArray(body.equipments) ? body.equipments : [] });
                }
            } catch (e) {
                if (!aborted) setData((d) => ({ ...d, loading: false }));
            }
        }
        load();
        return () => { aborted = true; };
    }, [reservationId]);

    if (data.loading) {
        return <div className="text-sm text-muted-foreground">Loading…</div>;
    }

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle className="text-lg">Reservation info</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="text-muted-foreground mb-2">Equipments</div>
                    {data.equipments.length ? (
                        <div className="grid grid-cols-1 gap-3">
                            {data.equipments.map((e, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {e?.image ? (
                                        <img src={e.image} alt={e.reference || e.mark || 'equipment'} className="h-10 w-10 rounded object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded bg-muted" />)}
                                    <div className="text-sm">
                                        <div className="font-medium break-words">{e?.reference || '—'}</div>
                                        <div className="text-muted-foreground break-words">{e?.mark || '—'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">No equipments.</div>
                    )}
                </div>
                <div>
                    <div className="text-muted-foreground mb-2">Team {data.team_name ? `— ${data.team_name}` : ''}</div>
                    {data.team_members.length ? (
                        <div className="grid grid-cols-1 gap-3">
                            {data.team_members.map((m, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {m?.image ? (
                                        <img src={m.image} alt={m.name || 'member'} className="h-9 w-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-muted" />)}
                                    <div className="text-sm font-medium break-words">{m?.name || '—'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">No team members.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
