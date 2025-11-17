import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Search, FileText, Download, ChevronDown, ChevronUp, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import ExportModal from './partials/ExportModal';
import StatCard from '../../../components/StatCard';
import ReservationDetailsModal from './components/ReservationDetailsModal';
import ReservationsTable from './components/ReservationsTable';

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
    const [showCharts, setShowCharts] = useState(false); // New state for chart visibility

    const onTypeChange = (v) => setFilterType(v === 'all' ? '' : v);
    const onStatusChange = (v) => setFilterStatus(v === 'all' ? '' : v);

    // Date range filter state
    const [fromDate, setFromDate] = useState(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState('');   // YYYY-MM-DD

    // Combine all reservations (including cowork) for the "All" tab and sort by created_at (most recent first)
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

        // Sort by created_at in descending order (most recent first)
        return mixed.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Descending order (newest first)
        });
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
    // Prepare data for charts dynamically from current reservation lists
    const statusData = [
        {
            name: 'Approved',
            all: filteredStatus.all.approved,
            cowork: filteredStatus.cowork.approved,
            studio: filteredStatus.studio.approved
        },
        {
            name: 'Canceled',
            all: filteredStatus.all.canceled,
            cowork: filteredStatus.cowork.canceled,
            studio: filteredStatus.studio.canceled
        },
        {
            name: 'Pending',
            all: filteredStatus.all.pending,
            cowork: filteredStatus.cowork.pending,
            studio: filteredStatus.studio.pending
        }
    ];

    const timelineData = [
        {
            period: 'Today',
            all: stats.timeAll.today,
            cowork: stats.timeCowork.today,
            studio: timeStudioPI.today
        },
        {
            period: 'This Week',
            all: stats.timeAll.week,
            cowork: stats.timeCowork.week,
            studio: timeStudioPI.week
        },
        {
            period: 'This Month',
            all: stats.timeAll.month,
            cowork: stats.timeCowork.month,
            studio: timeStudioPI.month
        }
    ];

    const distributionData = [
        { name: 'Cowork', value: baseCowork.length, color: '#3b82f6' },
        { name: 'Studios', value: baseStudioPI.length, color: '#8b5cf6' },
        { name: 'Other', value: baseAll.length - baseCowork.length - baseStudioPI.length, color: '#10b981' }
    ];
    if (Object.keys(perPlaceDynamic).length === 0) return null;

    // Convert your data into an array for StatCard
    const items = [
        ...Object.entries(perPlaceDynamic).map(([placeName, count]) => ({
            title: placeName,
            number: count,
            icon: ArrowRight,
        })),
        {
            title: "Exterior",
            number: exteriorCount,
            icon: ArrowRight,
        },
    ];
    // export
    const [showExportModal, setShowExportModal] = useState(false);

    return (
        <AppLayout>
            <Head title="Reservations" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-medium">Reservations</h1>
                        <p className="text-sm text-muted-foreground">{(rangeActive ? baseAll.length : allReservations.length)} total — {(rangeActive ? baseCowork.length : coworkReservations.length)} coworks — {(rangeActive ? baseStudio.length : studioReservations.length)} studios</p>
                    </div>
                    <div className="flex items-end justify-end">
                        <div className='flex gap-x-2'>

                            <Button onClick={() => setShowExportModal(true)}
                                className="flex items-center gap-2  bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer "
                            >
                                <Download /> Export
                            </Button>

                            <Link
                                href="/admin/reservations/analytics"
                                className="flex items-center gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer px-2 rounded-md"
                            >
                                <Activity className="w-6 h-4" />
                                Analytics
                            </Link>

                        </div>
                    </div>
                    <div className="flex items-center gap-2 ">
                        <div className="relative ">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 " />
                            <Input
                                type="text"
                                placeholder="Search reservations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64 bg-neutral-200 dark:bg-neutral-800"
                            />
                        </div>
                        <Select value={filterType || 'all'} onValueChange={onTypeChange}>
                            <SelectTrigger className="bg-neutral-200 dark:bg-neutral-800 w-44"><SelectValue placeholder="Type (all)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="cowork">Cowork</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="meeting_room">Meeting room</SelectItem>
                                <SelectItem value="exterior">Exterior</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus || 'all'} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-44 bg-neutral-200 dark:bg-neutral-800"><SelectValue placeholder="Status (all)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40 bg-neutral-200 dark:bg-neutral-800" />
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40 bg-neutral-200 dark:bg-neutral-800" />
                        <Button variant="outline" className="bg-neutral-200 dark:bg-neutral-800 " onClick={() => { setFromDate(''); setToDate(''); }}>Clear</Button>
                    </div>
                </div>




                {/* <StatCard items={items} /> */}



                <div className="mt-6">
                    <ReservationsTable
                        reservations={pagedAll}
                        loadingAction={loadingAction}
                        setLoadingAction={setLoadingAction}
                        onRowClick={(r) => {
                            // For studio reservations, navigate to details page
                            if ((r.type === 'studio' || r.place_type === 'studio') && r.type !== 'cowork') {
                                router.visit(`/admin/reservations/${r.id}/details`);
                            } else {
                                // For other types, show modal
                                setSelected(r);
                            }
                        }}
                    />
                    <div className="flex gap-5 mt-6 w-full items-center justify-center">
                        <button disabled={pageAll === 1} onClick={() => setPageAll((p) => Math.max(1, p - 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Previous page">{"<<"}</button>
                        <span>Page {pageAll} of {totalPagesAll}</span>
                        <button disabled={pageAll === totalPagesAll} onClick={() => setPageAll((p) => Math.min(totalPagesAll, p + 1))} className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50" aria-label="Next page">{"»»"}</button>
                    </div>
                </div>

                {/* Combined Details & Info Modal with Tabs */}
                <Dialog
                    open={!!selected || !!infoFor}
                    onOpenChange={() => {
                        setSelected(null);
                        setInfoFor(null);
                    }}
                >
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-light dark:bg-dark transition-colors duration-300">
                        {(selected || infoFor) && (
                            <ReservationDetailsModal
                                reservation={selected || infoFor}
                                loadingAction={loadingAction}
                                setLoadingAction={setLoadingAction}
                            />
                        )}
                    </DialogContent>
                </Dialog>

            </div>
            <ExportModal
                open={showExportModal}
                onClose={() => setShowExportModal(false)}
                reservations={rangeActive ? baseAll : allReservations}
                fromDate={fromDate}
                toDate={toDate}
            />
        </AppLayout>
    );
};

export default ReservationsIndex;

