import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Search, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatusBadge = ({ yes, trueText, falseText }) => (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${yes ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
        {yes ? trueText : falseText}
    </span>
);

// Helpers to normalize and compare dates
function parseYmd(dateStr) {
    // Expecting YYYY-MM-DD
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}
function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // 0..6 with Monday=0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfWeek(date) {
    const s = startOfWeek(date);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
}
function isWithin(date, start, end) {
    return !!date && (!start || date >= start) && (!end || date <= end);
}

function getItemDate(res) {
    // Prefer explicit date fields
    const dateStr = res?.date || res?.day || null;
    return parseYmd(dateStr);
}

function buildTimeStats(list) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let today = 0, week = 0, month = 0;
    for (const r of list) {
        const d = getItemDate(r);
        if (!d) continue;
        if (isWithin(d, todayStart, todayEnd)) today++;
        if (isWithin(d, weekStart, weekEnd)) week++;
        if (isWithin(d, monthStart, monthEnd)) month++;
    }
    return { today, week, month };
}

const ReservationsIndex = ({ reservations = [], coworkReservations = [], studioReservations = [], meetingRoomReservations = [] }) => {
    const [tab, setTab] = useState('all');
    const [loadingAction, setLoadingAction] = useState({ id: null, type: null });
    const [selected, setSelected] = useState(null);
    const [infoFor, setInfoFor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState(''); // '', 'cowork', 'studio', 'meeting_room', 'exterior'
    const [filterStatus, setFilterStatus] = useState(''); // '', 'approved', 'canceled', 'pending'

    const onTypeChange = (v) => setFilterType(v === 'all' ? '' : v);
    const onStatusChange = (v) => setFilterStatus(v === 'all' ? '' : v);

    // Date range filter state
    const [fromDate, setFromDate] = useState(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState('');   // YYYY-MM-DD

    // Combine all reservations (including cowork) for the "All" tab and sort by date+time
    const allReservations = useMemo(() => {
        const normalizedCowork = coworkReservations.map(c => ({
            ...c,
            type: 'cowork',
            title: `Cowork - Table ${c.table}`,
            date: c.day,
            start: c.start,
            end: c.end,
            place_type: 'cowork'
        }));

        const mixed = [...reservations, ...normalizedCowork];

        const parseDateTime = (item) => {
            const dateStr = item?.date || item?.day || '';
            const timeStr = item?.start || '00:00:00';
            const iso = `${dateStr}T${timeStr}`;
            const ts = Date.parse(iso);
            return Number.isFinite(ts) ? ts : 0;
        };

        return mixed.sort((a, b) => parseDateTime(b) - parseDateTime(a));
    }, [reservations, coworkReservations]);

    // Derived stats (global, not range-filtered)
    const stats = useMemo(() => {
        const totalAll = allReservations.length;
        const totalCowork = coworkReservations.length;
        const totalStudio = studioReservations.length;

        const timeAll = buildTimeStats(allReservations);
        const timeCowork = buildTimeStats(coworkReservations);
        const timeStudio = buildTimeStats(studioReservations);

        const perStudio = studioReservations.reduce((acc, r) => {
            const name = r.studio_name || r.studio || 'Unknown studio';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const byStatus = (list) => list.reduce((acc, r) => {
            if (r.canceled) acc.canceled++;
            else if (r.approved) acc.approved++;
            else acc.pending++;
            return acc;
        }, { approved: 0, canceled: 0, pending: 0 });

        const statusAll = byStatus(allReservations);
        const statusCowork = byStatus(coworkReservations);
        const statusStudio = byStatus(studioReservations);

        return { totalAll, totalCowork, totalStudio, timeAll, timeCowork, timeStudio, perStudio, statusAll, statusCowork, statusStudio };
    }, [allReservations, coworkReservations, studioReservations]);

    // Range boundaries
    const rangeStart = useMemo(() => (fromDate ? parseYmd(fromDate) : null), [fromDate]);
    const rangeEnd = useMemo(() => (toDate ? parseYmd(toDate) : null), [toDate]);
    const rangeActive = !!(rangeStart || rangeEnd);

    const inRange = React.useCallback((r) => {
        const d = getItemDate(r);
        return isWithin(d, rangeStart, rangeEnd);
    }, [rangeStart, rangeEnd]);

    // Filter reservations for range and search
    const baseAll = useMemo(() => (rangeActive ? allReservations.filter(inRange) : allReservations), [allReservations, rangeActive, inRange]);
    const baseCowork = useMemo(() => (rangeActive ? coworkReservations.filter(inRange) : coworkReservations), [coworkReservations, rangeActive, inRange]);
    const baseStudio = useMemo(() => (rangeActive ? studioReservations.filter(inRange) : studioReservations), [studioReservations, rangeActive, inRange]);
    const baseRooms = useMemo(() => (rangeActive ? meetingRoomReservations.filter(inRange) : meetingRoomReservations), [meetingRoomReservations, rangeActive, inRange]);

    // Exterior detection and lists
    const isExterior = React.useCallback((r) => {
        const t = (r?.type || '').toLowerCase();
        const pt = (r?.place_type || '').toLowerCase();
        const pn = (r?.place_name || '').toLowerCase();
        return t === 'exterior' || pt === 'exterior' || pt === 'outside' || pn === 'exterior' || pn === 'outside';
    }, []);
    const baseExterior = useMemo(() => baseAll.filter(isExterior), [baseAll, isExterior]);

    const filteredReservations = useMemo(() => {
        const typeMatch = (r) => {
            if (!filterType) return true;
            if (filterType === 'exterior') return isExterior(r);
            return (r?.type || '').toLowerCase() === filterType;
        };
        const statusMatch = (r) => {
            if (!filterStatus) return true;
            if (filterStatus === 'approved') return !!r.approved && !r.canceled;
            if (filterStatus === 'canceled') return !!r.canceled;
            if (filterStatus === 'pending') return !r.approved && !r.canceled;
            return true;
        };
        const term = searchTerm.toLowerCase();
        const searchMatch = (r) => {
            if (!term) return true;
            return (
                r.user_name?.toLowerCase().includes(term) ||
                r.title?.toLowerCase().includes(term) ||
                r.description?.toLowerCase().includes(term) ||
                r.type?.toLowerCase().includes(term) ||
                r.place_type?.toLowerCase().includes(term) ||
                r.date?.includes(term) ||
                `table ${r.table}`?.toLowerCase().includes(term)
            );
        };
        return baseAll.filter((r) => typeMatch(r) && statusMatch(r) && searchMatch(r));
    }, [baseAll, searchTerm, filterType, filterStatus, isExterior]);

    const filteredCoworkReservations = useMemo(() => {
        if (!searchTerm) return baseCowork;
        const term = searchTerm.toLowerCase();
        return baseCowork.filter(r =>
            r.user_name?.toLowerCase().includes(term) ||
            r.day?.includes(term) ||
            `table ${r.table}`?.toLowerCase().includes(term)
        );
    }, [baseCowork, searchTerm]);

    const filteredStudioReservations = useMemo(() => {
        if (!searchTerm) return baseStudio;
        const term = searchTerm.toLowerCase();
        return baseStudio.filter(r =>
            r.user_name?.toLowerCase().includes(term) ||
            r.title?.toLowerCase().includes(term) ||
            r.studio_name?.toLowerCase().includes(term) ||
            r.team_members?.toLowerCase().includes(term) ||
            (r.day || r.date)?.includes(term)
        );
    }, [baseStudio, searchTerm]);

    // Dynamic, range-aware status and per-studio from filtered lists
    const filteredStatus = useMemo(() => {
        const byStatus = (list) => list.reduce((acc, r) => {
            if (r.canceled) acc.canceled++;
            else if (r.approved) acc.approved++;
            else acc.pending++;
            return acc;
        }, { approved: 0, canceled: 0, pending: 0 });
        return {
            all: byStatus(baseAll),
            cowork: byStatus(baseCowork),
            studio: byStatus(baseStudio),
            room: byStatus(baseRooms),
        };
    }, [baseAll, baseCowork, baseStudio, baseRooms]);

    const perStudioDynamic = useMemo(() => {
        const data = baseStudio;
        return data.reduce((acc, r) => {
            const name = r.studio_name || r.studio || 'Unknown studio';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
    }, [baseStudio]);

    const perRoomDynamic = useMemo(() => {
        const data = baseRooms;
        return data.reduce((acc, r) => {
            const name = r.room_name || r.room || 'Meeting  room';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
    }, [baseRooms]);

    const perPlaceDynamic = useMemo(() => {
        const merged = { ...perStudioDynamic };
        for (const [roomName, count] of Object.entries(perRoomDynamic)) {
            merged[roomName] = (merged[roomName] || 0) + count;
        }
        return merged;
    }, [perStudioDynamic, perRoomDynamic]);

    const exteriorCount = useMemo(() => baseExterior.length, [baseExterior]);

    const total = useMemo(() => ({
        reservations: filteredReservations.length,
        coworks: filteredCoworkReservations.length,
        studios: filteredStudioReservations.length,
    }), [filteredReservations, filteredCoworkReservations, filteredStudioReservations]);

    // Pagination (same UX as Members) per tab
    const [pageAll, setPageAll] = useState(1);
    const [pageCowork, setPageCowork] = useState(1);
    const [pageStudio, setPageStudio] = useState(1);
    const [showAllCowork, setShowAllCowork] = useState(false);
    const [showAllStudio, setShowAllStudio] = useState(false);
    const perPage = 10;
    const pagedAll = filteredReservations.slice((pageAll - 1) * perPage, (pageAll - 1) * perPage + perPage);
    const pagedCowork = showAllCowork ? filteredCoworkReservations : filteredCoworkReservations.slice((pageCowork - 1) * perPage, (pageCowork - 1) * perPage + perPage);
    const pagedStudio = showAllStudio ? filteredStudioReservations : filteredStudioReservations.slice((pageStudio - 1) * perPage, (pageStudio - 1) * perPage + perPage);
    const totalPagesAll = Math.ceil(filteredReservations.length / perPage) || 1;
    const totalPagesCowork = showAllCowork ? 1 : (Math.ceil(filteredCoworkReservations.length / perPage) || 1);
    const totalPagesStudio = showAllStudio ? 1 : (Math.ceil(filteredStudioReservations.length / perPage) || 1);
    useEffect(() => { setPageAll(1); }, [filteredReservations]);
    useEffect(() => { setPageCowork(1); }, [filteredCoworkReservations, showAllCowork]);
    useEffect(() => { setPageStudio(1); }, [filteredStudioReservations, showAllStudio]);

    // Studio Podcast + Studio Image filtered list
    const baseStudioPI = useMemo(() => {
        const accepted = new Set(['studio podcast', 'studio image']);
        return baseStudio.filter(r => accepted.has((r.studio_name || r.studio || '').toLowerCase()));
    }, [baseStudio]);

    const timeStudioPI = useMemo(() => {
        if (rangeActive) return { today: 0, week: 0, month: 0 };
        const allStudio = studioReservations.filter(r => {
            const n = (r.studio_name || r.studio || '').toLowerCase();
            return n === 'studio podcast' || n === 'studio image';
        });
        return buildTimeStats(allStudio);
    }, [rangeActive, studioReservations]);

    return (
        <AppLayout>
            <Head title="Reservations" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-medium">Reservations</h1>
                        <p className="text-sm text-muted-foreground">{(rangeActive ? baseAll.length : allReservations.length)} total — {(rangeActive ? baseCowork.length : coworkReservations.length)} coworks — {(rangeActive ? baseStudio.length : studioReservations.length)} studios</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Select value={filterType || 'all'} onValueChange={onTypeChange}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Type (all)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="cowork">Cowork</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="meeting_room">Meeting room</SelectItem>
                                <SelectItem value="exterior">Exterior</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus || 'all'} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Status (all)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
                        <Button variant="outline" size="sm" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">All reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{baseAll.length}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Approved {filteredStatus.all.approved} • Canceled {filteredStatus.all.canceled} • Pending {filteredStatus.all.pending}</div>
                            {rangeActive && (
                                <div className="mt-1 text-xs text-muted-foreground">In range: {baseAll.length} — A {filteredStatus.all.approved} • C {filteredStatus.all.canceled} • P {filteredStatus.all.pending}</div>
                            )}
                            {!rangeActive && (
                                <div className="mt-2 text-sm text-muted-foreground">Today {stats.timeAll.today} • This week {stats.timeAll.week} • This month {stats.timeAll.month}</div>
                            )}
                        </CardContent>
                    </Card>
                           <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Cowork reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{baseCowork.length}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Approved {filteredStatus.cowork.approved} • Canceled {filteredStatus.cowork.canceled} • Pending {filteredStatus.cowork.pending}</div>
                            {rangeActive ? (
                                <div className="mt-1 text-xs text-muted-foreground">In range: {baseCowork.length} — A {filteredStatus.cowork.approved} • C {filteredStatus.cowork.canceled} • P {filteredStatus.cowork.pending}</div>
                            ) : (
                                <div className="mt-2 text-sm text-muted-foreground">Today {stats.timeCowork.today} • This week {stats.timeCowork.week} • This month {stats.timeCowork.month}</div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Removed Cowork card per request */}
                             <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Studios (Podcast + Image)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{baseStudioPI.length}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Approved {(() => baseStudioPI.reduce((n, r) => n + (r.approved && !r.canceled ? 1 : 0), 0))()} • Canceled {(() => baseStudioPI.reduce((n, r) => n + (r.canceled ? 1 : 0), 0))()} • Pending {(() => baseStudioPI.reduce((n, r) => n + (!r.approved && !r.canceled ? 1 : 0), 0))()}</div>
                            {rangeActive ? (
                                <div className="mt-1 text-xs text-muted-foreground">In range: {baseStudioPI.length}</div>
                            ) : (
                                <div className="mt-2 text-sm text-muted-foreground">Today {timeStudioPI.today} • This week {timeStudioPI.week} • This month {timeStudioPI.month}</div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Per-place breakdown (studios + meeting rooms, range-aware) */}
                {Object.keys(perPlaceDynamic).length > 0 && (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {Object.entries(perPlaceDynamic).map(([placeName, count]) => (
                            <Card key={placeName} className="min-h-[120px]">
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground truncate">{placeName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-semibold">{count}</div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card key="Exterior" className="min-h-[120px]">
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground truncate">Exterior</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{exteriorCount}</div>
                            </CardContent>
                        </Card>

                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button variant={tab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTab('all')} className={tab === 'all' ? 'bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]' : ''}>All reservations</Button>
                </div>

                {tab === 'all' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <table className="min-w-ful table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-60" />
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
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
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

                                                {r.approved && ((r.type || r.place_type) !== 'cowork') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2 cursor-pointer hover:bg-alpha  dark:hover:bg-alpha dark:text-white"
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
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="text-sm text-muted-foreground">{filteredCoworkReservations.length} cowork reservations</div>
                                <Button size="sm" variant="outline" onClick={() => setShowAllCowork(v => !v)} className="h-8">
                                    {showAllCowork ? 'Show 10 per page' : 'Show all'}
                                </Button>
                            </div>
                            <table className="min-w-full table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-40" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    <col className="w-32" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Table</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {pagedCowork.map((rc) => (
                                        <tr key={rc.id} className="hover:bg-accent/30">
                                            <td className="px-4 py-3 text-sm font-medium">{rc.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{rc.day}</td>
                                            <td className="px-4 py-3 text-sm">{rc.start} - {rc.end}</td>
                                            <td className="px-4 py-3 text-sm">Table {rc.table}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {rc.canceled ? (
                                                    <Badge variant="destructive">Canceled</Badge>
                                                ) : rc.passed ? (
                                                    <Badge>Passed</Badge>
                                                ) : (
                                                    <Badge className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)]">Active</Badge>
                                                )}
                                                <div className="mt-1">
                                                    <StatusBadge yes={!!rc.approved} trueText="Approved" falseText="Pending" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2 cursor-pointer"
                                                        onClick={() => setSelected({
                                                            ...rc,
                                                            date: rc.day,
                                                            type: 'cowork',
                                                            title: `Cowork - Table ${rc.table}`,
                                                            place_type: 'cowork'
                                                        })}
                                                        title="View details"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    {!rc.approved && !rc.canceled && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-2 cursor-pointer bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                                            disabled={loadingAction.id === rc.id}
                                                            onClick={() => {
                                                                setLoadingAction({ id: rc.id, type: 'approve' });
                                                                router.post(`/admin/reservations/${rc.id}/approve`, {}, {
                                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                                });
                                                            }}
                                                            title="Approve reservation"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {!rc.canceled && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 px-2 cursor-pointer disabled:opacity-50"
                                                            disabled={loadingAction.id === rc.id}
                                                            onClick={() => {
                                                                const confirmMsg = rc.approved ?
                                                                    'Cancel this approved reservation?' :
                                                                    'Cancel this reservation?';
                                                                if (!window.confirm(confirmMsg)) return;
                                                                setLoadingAction({ id: rc.id, type: 'cancel' });
                                                                router.post(`/admin/reservations/${rc.id}/cancel`, {}, {
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
                                    {filteredCoworkReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No cowork reservations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {!showAllCowork && (
                                <div className="flex gap-5 mt-6 w-full items-center justify-center">
                                    <button disabled={pageCowork === 1} onClick={() => setPageCowork((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                                    <span>Page {pageCowork} of {totalPagesCowork}</span>
                                    <button disabled={pageCowork === totalPagesCowork} onClick={() => setPageCowork((p) => Math.min(totalPagesCowork, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'studios' && (
                    <div className="mt-6">
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="text-sm text-muted-foreground">{filteredStudioReservations.length} studio reservations</div>
                                <Button size="sm" variant="outline" onClick={() => setShowAllStudio(v => !v)} className="h-8">
                                    {showAllStudio ? 'Show 10 per page' : 'Show all'}
                                </Button>
                            </div>
                            <table className="min-w-full table-fixed divide-y divide-sidebar-border/70">
                                <colgroup>
                                    <col className="w-56" />
                                    <col className="w-32" />
                                    <col className="w-40" />
                                    <col className="w-36" />
                                    <col className="w-28" />
                                    <col className="w-32" />
                                </colgroup>
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Studio</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sidebar-border/70">
                                    {pagedStudio.map((sr) => (
                                        <tr key={sr.id} className="hover:bg-accent/30">
                                            <td className="px-4 py-3 text-sm font-medium">{sr.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm">{sr.day ?? sr.date}</td>
                                            <td className="px-4 py-3 text-sm">{sr.start} - {sr.end}</td>
                                            <td className="px-4 py-3 text-sm">{sr.studio_name || '—'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {sr.canceled ? (
                                                    <Badge variant="destructive">Canceled</Badge>
                                                ) : sr.passed ? (
                                                    <Badge>Passed</Badge>
                                                ) : (
                                                    <Badge className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)]">Active</Badge>
                                                )}
                                                <div className="mt-1">
                                                    <StatusBadge yes={!!sr.approved} trueText="Approved" falseText="Pending" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">

                                                    {sr.approved && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 px-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                                                            onClick={() => {
                                                                window.open(`/admin/reservations/${sr.id}/pdf`, '_blank');
                                                            }}
                                                            title="Download PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {!sr.approved && !sr.canceled && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-2 cursor-pointer bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                                            disabled={loadingAction.id === sr.id}
                                                            onClick={() => {
                                                                setLoadingAction({ id: sr.id, type: 'approve' });
                                                                router.post(`/admin/reservations/${sr.id}/approve`, {}, {
                                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                                });
                                                            }}
                                                            title="Approve reservation"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {!sr.canceled && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 px-2 cursor-pointer disabled:opacity-50"
                                                            disabled={loadingAction.id === sr.id}
                                                            onClick={() => {
                                                                const confirmMsg = sr.approved ?
                                                                    'Cancel this approved reservation?' :
                                                                    'Cancel this reservation?';
                                                                if (!window.confirm(confirmMsg)) return;
                                                                setLoadingAction({ id: sr.id, type: 'cancel' });
                                                                router.post(`/admin/reservations/${sr.id}/cancel`, {}, {
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
                                    {filteredStudioReservations.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                No studio reservations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {!showAllStudio && (
                                <div className="flex gap-5 mt-6 w-full items-center justify-center">
                                    <button disabled={pageStudio === 1} onClick={() => setPageStudio((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                                    <span>Page {pageStudio} of {totalPagesStudio}</span>
                                    <button disabled={pageStudio === totalPagesStudio} onClick={() => setPageStudio((p) => Math.min(totalPagesStudio, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Combined Details & Info Modal with Tabs */}
                <Dialog open={!!selected || !!infoFor} onOpenChange={() => { setSelected(null); setInfoFor(null); }}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        {(selected || infoFor) && (
                            <ReservationModal
                                reservation={selected || infoFor}
                                loadingAction={loadingAction}
                                setLoadingAction={setLoadingAction}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

function ReservationModal({ reservation, loadingAction, setLoadingAction }) {
    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle className="text-lg">Reservation Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {((reservation.type || reservation.place_type) !== 'cowork') && (
                        <TabsTrigger value="info">Equipment & Team</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">User</div>
                            <div className="font-medium">{reservation.user_name ?? '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Type</div>
                            <div className="font-medium capitalize">{(reservation.type || reservation.place_type)?.replace('_',' ') ?? '—'}</div>
                        </div>
                        {((reservation.type || reservation.place_type) === 'studio') && (
                            <div>
                                <div className="text-muted-foreground">Studio Name</div>
                                <div className="font-medium">{reservation.studio_name || '—'}</div>
                            </div>
                        )}
                        {reservation.table && (
                            <div>
                                <div className="text-muted-foreground">Table</div>
                                <div className="font-medium">Table {reservation.table}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-muted-foreground">Date</div>
                            <div className="font-medium">{reservation.date}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Time</div>
                            <div className="font-medium">{reservation.start} - {reservation.end}</div>
                        </div>
                        {reservation.type !== 'cowork' && (
                            <>
                                <div className="col-span-2">
                                    <div className="text-muted-foreground">Title</div>
                                    <div className="font-medium">{reservation.title || '—'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-muted-foreground">Description</div>
                                    <div className="font-medium whitespace-pre-wrap break-words">{reservation.description || '—'}</div>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="text-muted-foreground">Approved</div>
                            <div><StatusBadge yes={!!reservation.approved} trueText="Approved" falseText="Pending" /></div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Status</div>
                            <div>{reservation.canceled ? <Badge variant="destructive">Canceled</Badge> : reservation.passed ? <Badge>Passed</Badge> : <Badge className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)]">Active</Badge>}</div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        {reservation.approved && reservation.type !== 'cowork' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => {
                                    window.open(`/admin/reservations/${reservation.id}/pdf`, '_blank');
                                }}
                            >
                                <Download className="h-4 w-4 mr-1" /> Download PDF
                            </Button>
                        )}
                        {!reservation.approved && !reservation.canceled && (
                            <Button
                                size="sm"
                                className="h-8 px-3 cursor-pointer bg-green-500 text-white hover:bg-green-600"
                                disabled={loadingAction.id === reservation.id}
                                onClick={() => {
                                    setLoadingAction({ id: reservation.id, type: 'approve' });
                                    router.post(`/admin/reservations/${reservation.id}/approve`, {}, {
                                        onFinish: () => setLoadingAction({ id: null, type: null })
                                    });
                                }}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                        )}
                        {!reservation.canceled && (
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-3 cursor-pointer"
                                disabled={loadingAction.id === reservation.id}
                                onClick={() => {
                                    const confirmMsg = reservation.approved ?
                                        'Cancel this approved reservation?' :
                                        'Cancel this reservation?';
                                    if (!window.confirm(confirmMsg)) return;
                                    setLoadingAction({ id: reservation.id, type: 'cancel' });
                                    router.post(`/admin/reservations/${reservation.id}/cancel`, {}, {
                                        onFinish: () => setLoadingAction({ id: null, type: null })
                                    });
                                }}
                            >
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        )}
                    </div>
                </TabsContent>

                {((reservation.type || reservation.place_type) !== 'cowork') && (
                    <TabsContent value="info" className="space-y-4">
                        <InfoModalContent reservationId={reservation.id} initial={reservation} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

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
    );
}

export default ReservationsIndex;

