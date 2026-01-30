import TablePagination from '@/components/TablePagination';
import { AlertCircle, CalendarX } from 'lucide-react';
import React from 'react';

export default function AttendanceTab({ absences = { data: [], meta: {} }, discipline = 0 }) {
    const absencesData = absences?.data || [];
    const meta = absences?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

    // Debug: Log absences data to console (remove in production)
    React.useEffect(() => {
        if (absencesData.length > 0) {
            //('Absences Data:', absencesData);
            //('Absences Meta:', meta);
        }
    }, [absencesData, meta]);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Get period status text and color
    const getPeriodStatus = (period) => {
        if (!period || period === 'present') return { text: 'Present', color: 'text-green-700 dark:text-green-300' };
        if (period === 'absent') return { text: 'Absent', color: 'text-error' };
        if (period === 'excused') return { text: 'Excused', color: 'text-blue-700 dark:text-blue-300' };
        if (period === 'late') return { text: 'Late', color: 'text-yellow-700 dark:text-yellow-300' };
        return { text: period, color: 'text-neutral-700 dark:text-neutral-300' };
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Stats Card - Matching Projects Tab Style */}
            <div className="mb-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-colors duration-300 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Total Absences */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <CalendarX className="h-7 w-7 text-dark" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{meta.total || 0}</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Total Absences</div>
                        </div>
                    </div>

                    {/* Discipline Score */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 shadow-lg dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
                            <AlertCircle className="h-7 w-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">{discipline}%</div>
                            <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">Discipline Score</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absence Days Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 bg-white py-5 dark:border-neutral-700 dark:bg-neutral-900">
                {absencesData.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">No absences recorded</div>
                ) : (
                    <>
                        <table className="min-w-full text-xs md:text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                    <th className="p-3 text-left font-semibold">Date</th>
                                    <th className="p-3 text-left font-semibold">Morning</th>
                                    <th className="p-3 text-left font-semibold">Lunch</th>
                                    <th className="p-3 text-left font-semibold">Evening</th>
                                    <th className="p-3 text-left font-semibold">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {absencesData.map((absence, index) => {
                                    const morningStatus = getPeriodStatus(absence.morning);
                                    const lunchStatus = getPeriodStatus(absence.lunch);
                                    const eveningStatus = getPeriodStatus(absence.evening);

                                    return (
                                        <tr
                                            key={absence.attendance_id || index}
                                            className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                                        >
                                            <td className="p-3 font-medium">{formatDate(absence.date)}</td>
                                            <td className={`p-3 font-semibold ${morningStatus.color}`}>{morningStatus.text}</td>
                                            <td className={`p-3 font-semibold ${lunchStatus.color}`}>{lunchStatus.text}</td>
                                            <td className={`p-3 font-semibold ${eveningStatus.color}`}>{eveningStatus.text}</td>
                                            <td className="p-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                {absence.notes && absence.notes.length > 0 ? `${absence.notes.length} note(s)` : 'No notes'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <TablePagination currentPage={meta.current_page || 1} lastPage={meta.last_page || 1} pageParam="absences_page" />
                    </>
                )}
            </div>
        </div>
    );
}
