
import React, { useMemo, useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import ReservationTable from '@/components/ReservationTable';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TablePagination from '@/components/TablePagination';

export default function ReservationsPage() {
  const { reservations = [], auth } = usePage().props;
  const userRoles = Array.isArray(auth?.user?.role)
    ? auth.user.role
    : [auth?.user?.role].filter(Boolean);
  const isStudioResponsable = userRoles.includes('studio_responsable');
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

  const effectiveTypeFilter = isStudioResponsable ? 'studio' : typeFilter;

  const filteredReservations = useMemo(() => {
    return sortedReservations.filter(r => {
      // status
      const statusOk =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && r.approved && !r.canceled) ||
        (statusFilter === 'pending' && !r.approved && !r.canceled) ||
        (statusFilter === 'canceled' && r.canceled);

      // type
      const typeVal = (r.type || r.place_type || '').toLowerCase().trim();
      const typeOk = effectiveTypeFilter === 'all' || typeVal === effectiveTypeFilter;

      // quick query matches user or date or time
      const q = query.trim().toLowerCase();
      const queryOk = q === '' ||
        (r.user_name || '').toLowerCase().includes(q) ||
        (r.date || '').toLowerCase().includes(q) ||
        (r.start || '').toLowerCase().includes(q) ||
        (r.end || '').toLowerCase().includes(q);

      return statusOk && typeOk && queryOk;
    });
  }, [sortedReservations, statusFilter, effectiveTypeFilter, query]);

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pagedReservations = filteredReservations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredReservations.length / perPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, effectiveTypeFilter, query, filteredReservations.length]);
  const columns = [
    { key: "user_name", label: "User" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time", render: r => (
      <span className="tabular-nums">{r.start} - {r.end}</span>
    ) },
    { key: "type", label: "Type", render: r => (
      <Badge variant="outline" className="bg-accent/30 border-accent/50 text-foreground capitalize">
        {(r.type || r.place_type)?.replace('_', ' ') ?? '—'}
      </Badge>
    ) },
    { key: "status", label: "Status", render: r => (
      r.canceled ? (
        <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20">Canceled</Badge>
      ) : r.approved ? (
        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">Approved</Badge>
      ) : (
        <Badge variant="outline" className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/20">Pending</Badge>
      )
    ) },
  ];
  const handleCancel = (reservationId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    router.post(`/reservations/${reservationId}/cancel`, {}, {
      onSuccess: () => router.reload(),
      onError: (errors) => {
        //alert(errors.message || 'Failed to cancel reservation. Please try again.');
      },
    });
  };

  const breadcrumbs = [
    { title: 'My Reservations', href: '/student/reservations' }
  ];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">Track, filter, and review your bookings.</p>
        </div>
        <div className="rounded-2xl border border-sidebar-border/60 bg-light dark:bg-dark/80 shadow-sm p-3 sm:p-6">
          <ReservationTable
            columns={columns}
            data={pagedReservations}
            onRowClick={row => {
              if (row.type === 'cowork' || row.place_type === 'cowork') {
                return;
              }
              router.visit(`/student/reservations/${row.id}/details`);
            }}
            renderActions={(row) => (
              !row.canceled && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => handleCancel(row.id, e)}
                >
                  Cancel
                </Button>
              )
            )}
            emptyState={
              <div className="flex flex-col items-center gap-3">
                <span>No reservations yet. Time to book your first one!</span>
                <Button variant="default" onClick={() => router.visit('/student/spaces')}>
                  Reserve Now
                </Button>
              </div>
            }
          />
          <div className="mt-4">
            <TablePagination
              currentPage={currentPage}
              lastPage={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
