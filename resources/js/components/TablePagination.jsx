import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function TablePagination({ currentPage, lastPage, onPageChange, pageParam = 'page' }) {
  if (lastPage <= 1) return null;

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      // If custom handler provided, use it (for client-side pagination)
      onPageChange(newPage);
    } else {
      // Otherwise, use Inertia router to make server request
      router.get(window.location.pathname + window.location.search, {
        [pageParam]: newPage
      }, {
        preserveState: true,
        preserveScroll: true,
        only: ['userProjects', 'collaborativeProjects', 'posts', 'reservations', 'trainings', 'absences']
      });
    }
  };

  return (
    <div className="flex gap-5 mt-6 w-full items-center justify-center">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
        aria-label="Previous page"
      >
        <ChevronsLeft />
      </button>
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        Page {currentPage} of {lastPage}
      </span>
      <button
        disabled={currentPage === lastPage}
        onClick={() => handlePageChange(Math.min(lastPage, currentPage + 1))}
        className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
        aria-label="Next page"
      >
        <ChevronsRight />
      </button>
    </div>
  );
}

