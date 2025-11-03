import React from "react";
import { GraduationCap, Award, BookOpen } from "lucide-react";
import TablePagination from "@/components/TablePagination";

export default function TrainingTab({ trainings = { data: [], meta: {} } }) {

  const trainingsData = trainings?.data || [];
  const meta = trainings?.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Card - Matching Projects Tab Style */}
      <div className="rounded-2xl shadow-lg p-6 mb-2 backdrop-blur-sm transition-colors duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Trainings */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <BookOpen className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                {meta.total || 0}
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Total Courses
              </div>
            </div>
          </div>

          {/* Certificates Placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <Award className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                0
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Certificates
              </div>
            </div>
          </div>

          {/* Highest Score Placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[var(--color-alpha)] to-yellow-400 dark:from-[var(--color-alpha)] dark:to-[var(--color-alpha)]">
              <GraduationCap className="w-7 h-7 text-[var(--color-dark)] dark:text-[var(--color-beta)]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-dark)] dark:text-light">
                N/A
              </div>
              <div className="text-sm font-semibold text-[var(--color-dark_gray)] dark:text-[var(--color-light)]">
                Highest Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {trainingsData.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No trainings found
          </div>
        ) : (
          <>
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="p-3 text-left font-semibold">Training</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {trainingsData.map((training, index) => (
                  <tr key={training.id || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 font-medium">{training.name || 'Untitled Training'}</td>
                    <td className="p-3">{formatDate(training.created_at)}</td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-400 text-xs max-w-md">
                      <div className="truncate" title={training.description}>
                        {training.description || 'No description available'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <TablePagination
              currentPage={meta.current_page || 1}
              lastPage={meta.last_page || 1}
              pageParam="trainings_page"
            />
          </>
        )}
      </div>
    </div>
  );
}
