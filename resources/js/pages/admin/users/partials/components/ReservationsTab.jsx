import React, { useMemo } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import TablePagination from "@/components/TablePagination";
import { router } from "@inertiajs/react";

export default function ReservationsTab({ reservations = { data: [], meta: {} } }) {

  const reservationsData = reservations?.data || [];
  const meta = reservations?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  // Calculate stats
  const stats = useMemo(() => {
    const active = reservationsData.filter(r => !r.canceled && !r.passed && r.approved).length;
    const returned = reservationsData.filter(r => r.passed).length;
    const overdue = reservationsData.filter(r => !r.canceled && !r.passed && !r.approved).length;

    return { active, returned, overdue };
  }, [reservationsData]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Get status badge
  const getStatusBadge = (reservation) => {
    if (reservation.canceled) {
      return { text: 'Canceled', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300', icon: XCircle };
    }
    if (reservation.passed) {
      return { text: 'Returned', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', icon: CheckCircle };
    }
    if (reservation.approved) {
      return { text: 'Active', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', icon: CheckCircle };
    }
    return { text: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300', icon: AlertCircle };
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Card - Matching Projects Tab Style */}
      <div className="rounded-2xl shadow-lg p-6 mb-2 backdrop-blur-sm transition-colors duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Reservations */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <CheckCircle className="w-7 h-7 text-dark" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.active}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Active
              </div>
            </div>
          </div>

          {/* Returned Reservations */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <Calendar className="w-7 h-7 text-dark" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.returned}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Returned
              </div>
            </div>
          </div>

          {/* Overdue/Pending Reservations */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <AlertCircle className="w-7 h-7 text-dark" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {stats.overdue}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Pending/Overdue
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {reservationsData.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No reservations found
          </div>
        ) : (
          <>
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-3 text-left font-semibold">Title</th>
                  <th className="p-3 text-left font-semibold">Day</th>
                  <th className="p-3 text-left font-semibold">Time</th>
                  <th className="p-3 text-left font-semibold">Type</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservationsData.map((reservation, index) => {
                  const statusBadge = getStatusBadge(reservation);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr onClick={() => router.visit(`/admin/reservations/${reservation.id}`)} key={reservation.id || index} className="hover:bg-neutral-50 cursor-pointer dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                      <td className="p-3 font-medium">{reservation.title || 'Untitled Reservation'}</td>
                      <td className="p-3 text-left">
                        <div className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          <span>{formatDate(reservation.day)}</span>
                        </div>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span>{formatTime(reservation.start)} - {formatTime(reservation.end)}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {reservation.type || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge.color} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <TablePagination
              currentPage={meta.current_page || 1}
              lastPage={meta.last_page || 1}
              pageParam="reservations_page"
            />
          </>
        )}
      </div>
    </div>
  );
}
