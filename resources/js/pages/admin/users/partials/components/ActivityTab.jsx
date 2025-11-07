import React from "react";
import TablePagination from "@/components/TablePagination";
import { CalendarX, AlertCircle } from "lucide-react";

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
      <div className="rounded-2xl shadow-lg p-6 mb-2 backdrop-blur-sm transition-colors duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Absences */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <CalendarX className="w-7 h-7 text-dark" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {meta.total || 0}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Total Absences
              </div>
            </div>
          </div>

          {/* Discipline Score */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <AlertCircle className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {discipline}%
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Discipline Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Absence Days Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-5">
        {absencesData.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No absences recorded
          </div>
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
                    <tr key={absence.attendance_id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                      <td className="p-3 font-medium">{formatDate(absence.date)}</td>
                      <td className={`p-3 font-semibold ${morningStatus.color}`}>
                        {morningStatus.text}
                      </td>
                      <td className={`p-3 font-semibold ${lunchStatus.color}`}>
                        {lunchStatus.text}
                      </td>
                      <td className={`p-3 font-semibold ${eveningStatus.color}`}>
                        {eveningStatus.text}
                      </td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400 text-xs">
                        {absence.notes && absence.notes.length > 0
                          ? `${absence.notes.length} note(s)`
                          : 'No notes'}
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
              pageParam="absences_page"
            />
          </>
        )}
      </div>
    </div>
  );
}
