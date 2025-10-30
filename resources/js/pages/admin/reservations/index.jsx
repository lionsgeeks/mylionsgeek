import Rolegard from '@/components/rolegard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Calendar, Check, ChevronDown, ChevronUp, Download, FileText, Search, TrendingUp, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ExportModal from './partials/ExportModal';
const StatusBadge = ({ yes, trueText, falseText }) => (
    <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${yes ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}
    >
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

    let today = 0,
        week = 0,
        month = 0;
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
    const [proposeFor, setProposeFor] = useState(null);
    const [proposal, setProposal] = useState({ day: '', start: '', end: '' });

    const onTypeChange = (v) => setFilterType(v === 'all' ? '' : v);
    const onStatusChange = (v) => setFilterStatus(v === 'all' ? '' : v);

    // Date range filter state
    const [fromDate, setFromDate] = useState(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState(''); // YYYY-MM-DD

    // Combine all reservations (including cowork) for the "All" tab and sort by date+time
    const allReservations = useMemo(() => {
        const normalizedCowork = coworkReservations.map((c) => ({
            ...c,
            type: 'cowork',
            title: `Cowork - Table ${c.table}`,
            date: c.day,
            start: c.start,
            end: c.end,
            place_type: 'cowork',
        }));

        const normalizedMeetingRooms = meetingRoomReservations.map((m) => ({
            ...m,
            type: 'meeting_room',
            title: `Meeting Room - ${m.room_name || 'Room'}`,
            date: m.day,
            start: m.start,
            end: m.end,
            place_type: 'meeting_room',
        }));

        const mixed = [...reservations, ...normalizedCowork, ...normalizedMeetingRooms];

        const parseDateTime = (item) => {
            const dateStr = item?.date || item?.day || '';
            const timeStr = item?.start || '00:00:00';
            const iso = `${dateStr}T${timeStr}`;
            const ts = Date.parse(iso);
            return Number.isFinite(ts) ? ts : 0;
        };

        return mixed.sort((a, b) => parseDateTime(b) - parseDateTime(a));
    }, [reservations, coworkReservations, meetingRoomReservations]);

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

        const byStatus = (list) =>
            list.reduce(
                (acc, r) => {
                    if (r.canceled) acc.canceled++;
                    else if (r.approved) acc.approved++;
                    else acc.pending++;
                    return acc;
                },
                { approved: 0, canceled: 0, pending: 0 },
            );

        const statusAll = byStatus(allReservations);
        const statusCowork = byStatus(coworkReservations);
        const statusStudio = byStatus(studioReservations);

        return { totalAll, totalCowork, totalStudio, timeAll, timeCowork, timeStudio, perStudio, statusAll, statusCowork, statusStudio };
    }, [allReservations, coworkReservations, studioReservations]);

    // Range boundaries
    const rangeStart = useMemo(() => (fromDate ? parseYmd(fromDate) : null), [fromDate]);
    const rangeEnd = useMemo(() => (toDate ? parseYmd(toDate) : null), [toDate]);
    const rangeActive = !!(rangeStart || rangeEnd);

    const inRange = React.useCallback(
        (r) => {
            const d = getItemDate(r);
            return isWithin(d, rangeStart, rangeEnd);
        },
        [rangeStart, rangeEnd],
    );

    // Filter reservations for range and search
    const baseAll = useMemo(() => (rangeActive ? allReservations.filter(inRange) : allReservations), [allReservations, rangeActive, inRange]);
    const baseCowork = useMemo(
        () => (rangeActive ? coworkReservations.filter(inRange) : coworkReservations),
        [coworkReservations, rangeActive, inRange],
    );
    const baseStudio = useMemo(
        () => (rangeActive ? studioReservations.filter(inRange) : studioReservations),
        [studioReservations, rangeActive, inRange],
    );
    const baseRooms = useMemo(
        () => (rangeActive ? meetingRoomReservations.filter(inRange) : meetingRoomReservations),
        [meetingRoomReservations, rangeActive, inRange],
    );

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
        return baseCowork.filter(
            (r) => r.user_name?.toLowerCase().includes(term) || r.day?.includes(term) || `table ${r.table}`?.toLowerCase().includes(term),
        );
    }, [baseCowork, searchTerm]);

    const filteredStudioReservations = useMemo(() => {
        if (!searchTerm) return baseStudio;
        const term = searchTerm.toLowerCase();
        return baseStudio.filter(
            (r) =>
                r.user_name?.toLowerCase().includes(term) ||
                r.title?.toLowerCase().includes(term) ||
                r.studio_name?.toLowerCase().includes(term) ||
                r.team_members?.toLowerCase().includes(term) ||
                (r.day || r.date)?.includes(term),
        );
    }, [baseStudio, searchTerm]);

    // Dynamic, range-aware status and per-studio from filtered lists
    const filteredStatus = useMemo(() => {
        const byStatus = (list) =>
            list.reduce(
                (acc, r) => {
                    if (r.canceled) acc.canceled++;
                    else if (r.approved) acc.approved++;
                    else acc.pending++;
                    return acc;
                },
                { approved: 0, canceled: 0, pending: 0 },
            );
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

    const total = useMemo(
        () => ({
            reservations: filteredReservations.length,
            coworks: filteredCoworkReservations.length,
            studios: filteredStudioReservations.length,
        }),
        [filteredReservations, filteredCoworkReservations, filteredStudioReservations],
    );

    // Pagination (same UX as Members) per tab
    const [pageAll, setPageAll] = useState(1);
    const [pageCowork, setPageCowork] = useState(1);
    const [pageStudio, setPageStudio] = useState(1);
    const [showAllCowork, setShowAllCowork] = useState(false);
    const [showAllStudio, setShowAllStudio] = useState(false);
    const perPage = 10;
    const pagedAll = filteredReservations.slice((pageAll - 1) * perPage, (pageAll - 1) * perPage + perPage);
    const pagedCowork = showAllCowork
        ? filteredCoworkReservations
        : filteredCoworkReservations.slice((pageCowork - 1) * perPage, (pageCowork - 1) * perPage + perPage);
    const pagedStudio = showAllStudio
        ? filteredStudioReservations
        : filteredStudioReservations.slice((pageStudio - 1) * perPage, (pageStudio - 1) * perPage + perPage);
    const totalPagesAll = Math.ceil(filteredReservations.length / perPage) || 1;
    const totalPagesCowork = showAllCowork ? 1 : Math.ceil(filteredCoworkReservations.length / perPage) || 1;
    const totalPagesStudio = showAllStudio ? 1 : Math.ceil(filteredStudioReservations.length / perPage) || 1;
    useEffect(() => {
        setPageAll(1);
    }, [filteredReservations]);
    useEffect(() => {
        setPageCowork(1);
    }, [filteredCoworkReservations, showAllCowork]);
    useEffect(() => {
        setPageStudio(1);
    }, [filteredStudioReservations, showAllStudio]);

    // Studio Podcast + Studio Image filtered list
    const baseStudioPI = useMemo(() => {
        const accepted = new Set(['studio podcast', 'studio image']);
        return baseStudio.filter((r) => accepted.has((r.studio_name || r.studio || '').toLowerCase()));
    }, [baseStudio]);

    const timeStudioPI = useMemo(() => {
        if (rangeActive) return { today: 0, week: 0, month: 0 };
        const allStudio = studioReservations.filter((r) => {
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
            studio: filteredStatus.studio.approved,
        },
        {
            name: 'Canceled',
            all: filteredStatus.all.canceled,
            cowork: filteredStatus.cowork.canceled,
            studio: filteredStatus.studio.canceled,
        },
        {
            name: 'Pending',
            all: filteredStatus.all.pending,
            cowork: filteredStatus.cowork.pending,
            studio: filteredStatus.studio.pending,
        },
    ];

    const timelineData = [
        {
            period: 'Today',
            all: stats.timeAll.today,
            cowork: stats.timeCowork.today,
            studio: timeStudioPI.today,
        },
        {
            period: 'This Week',
            all: stats.timeAll.week,
            cowork: stats.timeCowork.week,
            studio: timeStudioPI.week,
        },
        {
            period: 'This Month',
            all: stats.timeAll.month,
            cowork: stats.timeCowork.month,
            studio: timeStudioPI.month,
        },
    ];

    const distributionData = [
        { name: 'Cowork', value: baseCowork.length, color: '#3b82f6' },
        { name: 'Studios', value: baseStudioPI.length, color: '#8b5cf6' },
        { name: 'Other', value: baseAll.length - baseCowork.length - baseStudioPI.length, color: '#10b981' },
    ];

    // export
    const [showExportModal, setShowExportModal] = useState(false);
    return (
        <AppLayout>
            <Head title="Reservations" />
            <div className="flex flex-col gap-6 px-4 py-6 sm:p-8 lg:gap-10 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-medium">Reservations</h1>
                        <p className="text-sm text-muted-foreground">
                            {rangeActive ? baseAll.length : allReservations.length} total —{' '}
                            {rangeActive ? baseCowork.length : coworkReservations.length} coworks —{' '}
                            {rangeActive ? baseStudio.length : studioReservations.length} studios
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search reservations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 bg-neutral-200 pl-10 dark:bg-neutral-800"
                            />
                        </div>
                        <Select value={filterType || 'all'} onValueChange={onTypeChange}>
                            <SelectTrigger className="w-44 bg-neutral-200 dark:bg-neutral-800">
                                <SelectValue placeholder="Type (all)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="cowork">Cowork</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="meeting_room">Meeting room</SelectItem>
                                <SelectItem value="exterior">Exterior</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus || 'all'} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-44 bg-neutral-200 dark:bg-neutral-800">
                                <SelectValue placeholder="Status (all)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-40 bg-neutral-200 dark:bg-neutral-800"
                        />
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-40 bg-neutral-200 dark:bg-neutral-800"
                        />
                        <Button
                            variant="outline"
                            className="bg-neutral-200 dark:bg-neutral-800"
                            onClick={() => {
                                setFromDate('');
                                setToDate('');
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Charts Toggle Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={() => setShowCharts(!showCharts)}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        {showCharts ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Hide Charts & Analytics
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Show Charts & Analytics
                            </>
                        )}
                    </Button>
                </div>

                {/* Charts Section - Conditionally Rendered */}
                {showCharts && (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Charts Section */}
                            <div className="grid gap-6 md:grid-cols-2 lg:col-span-3 lg:grid-cols-2">
                                {/* Status Distribution Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                            Status Distribution by Category
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={statusData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                                                <YAxis tick={{ fill: '#6b7280' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="all" name="All" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                                <Bar dataKey="cowork" name="Cowork" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                                <Bar dataKey="studio" name="Studios" fill="#10b981" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Reservation Distribution Pie Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-purple-600" />
                                            Reservation Type Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={distributionData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {distributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Timeline Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Reservation Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="period" tick={{ fill: '#6b7280' }} />
                                        <YAxis tick={{ fill: '#6b7280' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="all"
                                            name="All Reservations"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line type="monotone" dataKey="cowork" name="Cowork" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="studio" name="Studios" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
                <Rolegard authorized={['admin', 'super_admin']}>
                    <div className="flex items-center justify-between">
                        <Button
                            variant={tab === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTab('all')}
                            className={
                                tab === 'all'
                                    ? 'border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]'
                                    : ''
                            }
                        >
                            All reservations
                        </Button>
                        <div className="flex gap-x-2">
                            <Button
                                onClick={() => setShowExportModal(true)}
                                className="flex cursor-pointer items-center gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                            >
                                <Download /> Export
                            </Button>

                            <Link
                                href="/admin/reservations/analytics"
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-2 text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                            >
                                <Activity className="h-4 w-6" />
                                Analytics
                            </Link>
                        </div>
                    </div>
                </Rolegard>
                {/* Per-place breakdown (studios + meeting rooms, range-aware) */}
                {Object.keys(perPlaceDynamic).length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {Object.entries(perPlaceDynamic).map(([placeName, count]) => (
                            <Card key={placeName} className="min-h-[120px]">
                                <CardHeader>
                                    <CardTitle className="truncate text-sm text-muted-foreground">{placeName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-semibold">{count}</div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card key="Exterior" className="min-h-[120px]">
                            <CardHeader>
                                <CardTitle className="truncate text-sm text-muted-foreground">Exterior</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{exteriorCount}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="mt-6">
                    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                        <table className="min-w-full table-auto divide-y divide-sidebar-border/70">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <Rolegard authorized={['admin', 'moderateur', 'super_admin']}>
                                        {pagedAll.some((r) => r.type !== 'cowork') && (
                                            <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                                        )}
                                    </Rolegard>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {pagedAll.map((r) => (
                                    <tr key={r.id} className="cursor-pointer hover:bg-accent/30" onClick={() => setSelected(r)}>
                                        <td className="truncate px-4 py-3 text-sm">{r.user_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{r.date}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {r.start} - {r.end}
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">{(r.type || r.place_type)?.replace('_', ' ') ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {r.canceled ? (
                                                <Badge variant="destructive">Canceled</Badge>
                                            ) : r.approved ? (
                                                <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                            )}
                                        </td>
                                        <Rolegard authorized={['admin', 'moderateur', 'super_admin']}>
                                            <td className="py-3 text-center text-sm" onClick={(e) => e.stopPropagation()}>
                                                <div className="inline-flex items-center justify-center gap-2">
                                                    {/* PDF Download - Only for non-cowork approved reservations */}
                                                    {r.approved && r.type !== 'cowork' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 cursor-pointer px-2 hover:bg-alpha dark:text-white dark:hover:bg-alpha"
                                                            onClick={() => {
                                                                window.open(`/admin/reservations/${r.id}/pdf`, '_blank');
                                                            }}
                                                            title="Download PDF"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {/* Approve Button - Only for non-cowork pending reservations */}
                                                    {!r.canceled && !r.approved && r.type !== 'cowork' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 cursor-pointer bg-green-500 px-2 text-white hover:bg-green-600 disabled:opacity-50"
                                                            disabled={loadingAction.id === r.id}
                                                            onClick={() => {
                                                                setLoadingAction({ id: r.id, type: 'approve' });
                                                                router.post(
                                                                    `/admin/reservations/${r.id}/approve`,
                                                                    {},
                                                                    {
                                                                        onFinish: () => setLoadingAction({ id: null, type: null }),
                                                                    },
                                                                );
                                                            }}
                                                            title="Approve reservation"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {/* Cancel Button - For all non-canceled reservations */}
                                                    {!r.canceled && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 cursor-pointer px-2 disabled:opacity-50"
                                                            disabled={loadingAction.id === r.id}
                                                            onClick={() => {
                                                                const confirmMsg = r.approved
                                                                    ? 'Cancel this approved reservation?'
                                                                    : 'Cancel this reservation?';
                                                                if (!window.confirm(confirmMsg)) return;
                                                                setLoadingAction({ id: r.id, type: 'cancel' });

                                                                // Use different routes for cowork vs regular reservations
                                                                const cancelRoute =
                                                                    r.type === 'cowork'
                                                                        ? `/admin/reservations/cowork/${r.id}/cancel`
                                                                        : `/admin/reservations/${r.id}/cancel`;

                                                                router.post(
                                                                    cancelRoute,
                                                                    {},
                                                                    {
                                                                        onFinish: () => setLoadingAction({ id: null, type: null }),
                                                                    },
                                                                );
                                                            }}
                                                            title="Cancel reservation"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {/* Propose new time - available for non-cowork */}
                                                    <Rolegard authorized={['admin', 'moderateur', 'super_admin']}>
                                                        {r.type !== 'cowork' && !r.canceled && !r.approved && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 cursor-pointer px-2"
                                                                onClick={() => {
                                                                    setProposeFor(r);
                                                                    setProposal({ day: r.date || '', start: r.start || '', end: r.end || '' });
                                                                }}
                                                                title="Propose a new date/time"
                                                            >
                                                                Propose time
                                                            </Button>
                                                        )}
                                                    </Rolegard>
                                                </div>
                                            </td>
                                        </Rolegard>
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
                        <div className="mt-6 flex w-full items-center justify-center gap-5">
                            <button
                                disabled={pageAll === 1}
                                onClick={() => setPageAll((p) => Math.max(1, p - 1))}
                                className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-50 dark:bg-light dark:text-dark"
                                aria-label="Previous page"
                            >
                                {'<<'}
                            </button>
                            <span>
                                Page {pageAll} of {totalPagesAll}
                            </span>
                            <button
                                disabled={pageAll === totalPagesAll}
                                onClick={() => setPageAll((p) => Math.min(totalPagesAll, p + 1))}
                                className="cursor-pointer rounded-lg bg-beta p-2 text-light disabled:opacity-50 dark:bg-light dark:text-dark"
                                aria-label="Next page"
                            >
                                {'»»'}
                            </button>
                        </div>
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
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                        {(selected || infoFor) && (
                            <ReservationModal reservation={selected || infoFor} loadingAction={loadingAction} setLoadingAction={setLoadingAction} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            <ExportModal open={showExportModal} onClose={() => setShowExportModal(false)} reservations={filteredReservations} />

            {/* Propose new time modal */}
            <Dialog open={!!proposeFor} onOpenChange={() => setProposeFor(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Propose new time</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm text-muted-foreground">Date</label>
                            <Input type="date" value={proposal.day} onChange={(e) => setProposal((p) => ({ ...p, day: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm text-muted-foreground">Start</label>
                                <Input type="time" value={proposal.start} onChange={(e) => setProposal((p) => ({ ...p, start: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">End</label>
                                <Input type="time" value={proposal.end} onChange={(e) => setProposal((p) => ({ ...p, end: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" className="cursor-pointer" onClick={() => setProposeFor(null)}>
                                Cancel
                            </Button>
                            <Button
                                className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                onClick={() => {
                                    if (!proposal.day || !proposal.start || !proposal.end) {
                                        alert('Please provide date, start and end.');
                                        return;
                                    }
                                    router.post(
                                        `/admin/reservations/${proposeFor.id}/propose`,
                                        {
                                            day: proposal.day,
                                            start: proposal.start,
                                            end: proposal.end,
                                        },
                                        {
                                            onFinish: () => {
                                                setProposeFor(null);
                                            },
                                        },
                                    );
                                }}
                            >
                                Send proposal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
                    {(reservation.type || reservation.place_type) !== 'cowork' && <TabsTrigger value="info">Equipment & Team</TabsTrigger>}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">User</div>
                            <div className="font-medium">{reservation.user_name ?? '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Type</div>
                            <div className="font-medium capitalize">{(reservation.type || reservation.place_type)?.replace('_', ' ') ?? '—'}</div>
                        </div>
                        {(reservation.type || reservation.place_type) === 'studio' && (
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
                            <div className="font-medium">
                                {reservation.start} - {reservation.end}
                            </div>
                        </div>
                        {reservation.type !== 'cowork' && (
                            <>
                                <div className="col-span-2">
                                    <div className="text-muted-foreground">Title</div>
                                    <div className="font-medium">{reservation.title || '—'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-muted-foreground">Description</div>
                                    <div className="font-medium break-words whitespace-pre-wrap">{reservation.description || '—'}</div>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="text-muted-foreground">Approved</div>
                            <div>
                                <StatusBadge yes={!!reservation.approved} trueText="Approved" falseText="Pending" />
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Status</div>
                            <div>
                                {reservation.canceled ? (
                                    <Badge variant="destructive">Canceled</Badge>
                                ) : reservation.passed ? (
                                    <Badge>Passed</Badge>
                                ) : (
                                    <Badge className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black">Active</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 cursor-pointer px-3"
                            onClick={() => {
                                router.visit(`/admin/reservations/${reservation.id}/details`);
                            }}
                        >
                            <FileText className="mr-1 h-4 w-4" /> View Full Details
                        </Button>
                        {reservation.approved && reservation.type !== 'cowork' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 cursor-pointer bg-blue-500 px-3 text-white hover:bg-blue-600"
                                onClick={() => {
                                    window.open(`/admin/reservations/${reservation.id}/pdf`, '_blank');
                                }}
                            >
                                <Download className="mr-1 h-4 w-4" /> Download PDF
                            </Button>
                        )}
                        {!reservation.approved && !reservation.canceled && (
                            <Button
                                size="sm"
                                className="h-8 cursor-pointer bg-green-500 px-3 text-white hover:bg-green-600"
                                disabled={loadingAction.id === reservation.id}
                                onClick={() => {
                                    setLoadingAction({ id: reservation.id, type: 'approve' });
                                    router.post(
                                        `/admin/reservations/${reservation.id}/approve`,
                                        {},
                                        {
                                            onFinish: () => setLoadingAction({ id: null, type: null }),
                                        },
                                    );
                                }}
                            >
                                <Check className="mr-1 h-4 w-4" /> Approve
                            </Button>
                        )}
                        {!reservation.canceled && (
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 cursor-pointer px-3"
                                disabled={loadingAction.id === reservation.id}
                                onClick={() => {
                                    const confirmMsg = reservation.approved ? 'Cancel this approved reservation?' : 'Cancel this reservation?';
                                    if (!window.confirm(confirmMsg)) return;
                                    setLoadingAction({ id: reservation.id, type: 'cancel' });

                                    // Use different routes for cowork vs regular reservations
                                    const cancelRoute =
                                        reservation.type === 'cowork'
                                            ? `/admin/reservations/cowork/${reservation.id}/cancel`
                                            : `/admin/reservations/${reservation.id}/cancel`;

                                    router.post(
                                        cancelRoute,
                                        {},
                                        {
                                            onFinish: () => setLoadingAction({ id: null, type: null }),
                                        },
                                    );
                                }}
                            >
                                <X className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                        )}
                    </div>
                </TabsContent>

                {(reservation.type || reservation.place_type) !== 'cowork' && (
                    <TabsContent value="info" className="space-y-4">
                        <InfoModalContent reservationId={reservation.id} initial={reservation} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function InfoModalContent({ reservationId, initial }) {
    const [data, setData] = React.useState({
        loading: true,
        team_name: initial.team_name,
        team_members: initial.team_members,
        equipments: initial.equipments,
    });

    React.useEffect(() => {
        let aborted = false;
        async function load() {
            try {
                const res = await fetch(`/admin/reservations/${reservationId}/info`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                const body = await res.json();
                if (!aborted) {
                    setData({
                        loading: false,
                        team_name: body.team_name ?? null,
                        team_members: Array.isArray(body.team_members) ? body.team_members : [],
                        equipments: Array.isArray(body.equipments) ? body.equipments : [],
                    });
                }
            } catch (e) {
                if (!aborted) setData((d) => ({ ...d, loading: false }));
            }
        }
        load();
        return () => {
            aborted = true;
        };
    }, [reservationId]);

    if (data.loading) {
        return <div className="text-sm text-muted-foreground">Loading…</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <div className="mb-2 text-muted-foreground">Equipments</div>
                {data.equipments.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {data.equipments.map((e, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                {e?.image ? (
                                    <img src={e.image} alt={e.reference || e.mark || 'equipment'} className="h-10 w-10 rounded object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-muted" />
                                )}
                                <div className="text-sm">
                                    <div className="font-medium break-words">{e?.reference || '—'}</div>
                                    <div className="break-words text-muted-foreground">{e?.mark || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">No equipments.</div>
                )}
            </div>
            <div>
                <div className="mb-2 text-muted-foreground">Team {data.team_name ? `— ${data.team_name}` : ''}</div>
                {data.team_members.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {data.team_members.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                {m?.image ? (
                                    <img src={m.image} alt={m.name || 'member'} className="h-9 w-9 rounded-full object-cover" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-muted" />
                                )}
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
