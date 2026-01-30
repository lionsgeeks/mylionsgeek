import TablePagination from '@/components/TablePagination';
import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function ReservationsTab({ reservations = { data: [], meta: {} } }) {
    const reservationsData = reservations?.data || [];
    const meta = reservations?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

    // Calculate stats
    const stats = useMemo(() => {
        const active = reservationsData.filter((r) => !r.canceled && !r.passed && r.approved).length;
        const returned = reservationsData.filter((r) => r.passed).length;
        const overdue = reservationsData.filter((r) => !r.canceled && !r.passed && !r.approved).length;

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
            <div className="mb-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-colors duration-300 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Active Reservations */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <CheckCircle className="h-7 w-7 text-dark" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.active}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Active</div>
                        </div>
                    </div>

                    {/* Returned Reservations */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <Calendar className="h-7 w-7 text-dark" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.returned}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Returned</div>
                        </div>
                    </div>

                    {/* Overdue/Pending Reservations */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <AlertCircle className="h-7 w-7 text-dark" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{stats.overdue}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Pending/Overdue</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                {reservationsData.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">No reservations found</div>
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
                                        <tr
                                            onClick={() => router.visit(`/admin/reservations/${reservation.id}`)}
                                            key={reservation.id || index}
                                            className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                                        >
                                            <td className="p-3 font-medium">{reservation.title || 'Untitled Reservation'}</td>
                                            <td className="p-3 text-left">
                                                <div className="inline-flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-500" />
                                                    <span>{formatDate(reservation.day)}</span>
                                                </div>
                                            </td>
                                            <td className="flex items-center gap-2 p-3">
                                                <Clock className="h-4 w-4 text-neutral-500" />
                                                <span>
                                                    {formatTime(reservation.start)} - {formatTime(reservation.end)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                    {reservation.type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-semibold ${statusBadge.color} flex w-fit items-center gap-1`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusBadge.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <TablePagination currentPage={meta.current_page || 1} lastPage={meta.last_page || 1} pageParam="reservations_page" />
                    </>
                )}
            </div>
        </div>
    );
}
