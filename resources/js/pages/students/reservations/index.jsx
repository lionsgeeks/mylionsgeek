import ReservationTable from '@/components/ReservationTable';
import TablePagination from '@/components/TablePagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function ReservationsPage() {
    const { reservations = [] } = usePage().props;
    const parseTs = (s) => {
        if (!s || typeof s !== 'string') return 0;
        const isoish = s.includes('T') ? s : s.replace(' ', 'T');
        const t = Date.parse(isoish);
        return Number.isFinite(t) ? t : 0;
    };
    const sortedReservations = useMemo(() => [...reservations].sort((a, b) => parseTs(b.created_at) - parseTs(a.created_at)), [reservations]);

    // Page controls
    const [statusFilter, setStatusFilter] = useState('all'); // all | approved | pending | canceled
    const [typeFilter, setTypeFilter] = useState('all');
    const [query, setQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 7;

    const filteredReservations = useMemo(() => {
        return sortedReservations.filter((r) => {
            // status
            const statusOk =
                statusFilter === 'all' ||
                (statusFilter === 'approved' && r.approved && !r.canceled) ||
                (statusFilter === 'pending' && !r.approved && !r.canceled) ||
                (statusFilter === 'canceled' && r.canceled);

            // type
            const typeVal = (r.type || r.place_type || '').toLowerCase();
            const typeOk = typeFilter === 'all' || typeVal === typeFilter;

            // quick query matches user or date or time
            const q = query.trim().toLowerCase();
            const queryOk =
                q === '' ||
                (r.user_name || '').toLowerCase().includes(q) ||
                (r.date || '').toLowerCase().includes(q) ||
                (r.start || '').toLowerCase().includes(q) ||
                (r.end || '').toLowerCase().includes(q);

            return statusOk && typeOk && queryOk;
        });
    }, [sortedReservations, statusFilter, typeFilter, query]);

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pagedReservations = filteredReservations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredReservations.length / perPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, query, filteredReservations.length]);
    const columns = [
        { key: 'user_name', label: 'User' },
        { key: 'date', label: 'Date' },
        {
            key: 'time',
            label: 'Time',
            render: (r) => (
                <span className="tabular-nums">
                    {r.start} - {r.end}
                </span>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            render: (r) => (
                <Badge variant="outline" className="border-accent/50 bg-accent/30 text-foreground capitalize">
                    {(r.type || r.place_type)?.replace('_', ' ') ?? '—'}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) =>
                r.canceled ? (
                    <Badge variant="outline" className="border-red-500/20 bg-red-500/15 text-red-700 dark:text-red-300">
                        Canceled
                    </Badge>
                ) : r.approved ? (
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Approved
                    </Badge>
                ) : (
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/15 text-amber-800 dark:text-amber-300">
                        Pending
                    </Badge>
                ),
        },
    ];
    const handleCancel = (reservationId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        router.post(
            `/reservations/${reservationId}/cancel`,
            {},
            {
                onSuccess: () => router.reload(),
                onError: (errors) => {
                    //alert(errors.message || 'Failed to cancel reservation. Please try again.');
                },
            },
        );
    };

    const breadcrumbs = [{ title: 'My Reservations', href: '/students/reservations' }];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto min-h-[80vh] w-full max-w-6xl px-4 py-4 sm:min-h-[85vh] sm:px-6 sm:py-6">
                <div className="mb-4 text-center sm:mb-6 sm:text-left">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Reservations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Track, filter, and review your reservations.</p>
                </div>
                <div className="rounded-2xl border border-sidebar-border/60 bg-light p-3 shadow-sm sm:p-6 dark:bg-dark/80">
                    <ReservationTable
                        columns={columns}
                        data={pagedReservations}
                        onRowClick={(row) => {
                            if (row.type === 'cowork' || row.place_type === 'cowork') {
                                return;
                            }
                            router.visit(`/students/reservations/${row.id}/details`);
                        }}
                        renderActions={(row) =>
                            !row.canceled && (
                                <Button variant="destructive" size="sm" onClick={(e) => handleCancel(row.id, e)}>
                                    Cancel
                                </Button>
                            )
                        }
                        emptyState={
                            <div className="flex flex-col items-center gap-3">
                                <span>No reservations yet. Time to book your first one!</span>
                                <Button variant="default" onClick={() => router.visit('/students/spaces')}>
                                    Reserve Now
                                </Button>
                            </div>
                        }
                    />
                    <div className="mt-4">
                        <TablePagination currentPage={currentPage} lastPage={totalPages} onPageChange={(page) => setCurrentPage(page)} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
