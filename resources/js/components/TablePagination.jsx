import { router } from '@inertiajs/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function TablePagination({ currentPage, lastPage, onPageChange, pageParam = 'page' }) {
    if (lastPage <= 1) return null;

    const handlePageChange = (newPage) => {
        if (onPageChange) {
            // If custom handler provided, use it (for client-side pagination)
            onPageChange(newPage);
        } else {
            // Otherwise, use Inertia router to make server request
            router.get(
                window.location.pathname + window.location.search,
                {
                    [pageParam]: newPage,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['userProjects', 'collaborativeProjects', 'posts', 'reservations', 'trainings', 'absences'],
                },
            );
        }
    };

    return (
        <div className="mt-6 flex w-full items-center justify-center gap-5">
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="cursor-pointer rounded-lg bg-beta p-2 text-light transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-light dark:text-dark"
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
                className="cursor-pointer rounded-lg bg-beta p-2 text-light transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-light dark:text-dark"
                aria-label="Next page"
            >
                <ChevronsRight />
            </button>
        </div>
    );
}
