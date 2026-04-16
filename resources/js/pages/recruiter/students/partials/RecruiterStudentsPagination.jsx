import { buttonVariants } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Page numbers with ellipses for large page counts. */
function buildPageItems(current, last) {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const set = new Set([1, last, current, current - 1, current + 1]);
    const sorted = [...set].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i += 1) {
        const p = sorted[i];
        if (i > 0 && p - sorted[i - 1] > 1) {
            out.push('ellipsis');
        }
        out.push(p);
    }
    return out;
}

export default function RecruiterStudentsPagination({ meta }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const current = meta.current_page;
    const last = meta.last_page;
    const items = buildPageItems(current, last);

    const pageLinkClass = (active) =>
        cn(
            buttonVariants({
                variant: active ? 'outline' : 'ghost',
                size: 'icon',
            }),
            'min-w-9',
        );

    const navBtnClass = (disabled) =>
        cn(
            buttonVariants({ variant: 'ghost', size: 'default' }),
            'gap-1 px-2.5',
            disabled && 'pointer-events-none opacity-40',
        );

    return (
        <Pagination className="mt-8">
            <PaginationContent className="flex-wrap gap-1">
                <PaginationItem>
                    {current <= 1 ? (
                        <span className={navBtnClass(true)} aria-disabled>
                            <ChevronLeft className="size-4" />
                            <span>Previous</span>
                        </span>
                    ) : (
                        <Link href={`/recruiter/students?page=${current - 1}`} preserveScroll preserveState className={navBtnClass(false)}>
                            <ChevronLeft className="size-4" />
                            <span>Previous</span>
                        </Link>
                    )}
                </PaginationItem>

                {items.map((item, idx) =>
                    item === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={item}>
                            <Link
                                href={`/recruiter/students?page=${item}`}
                                preserveScroll
                                preserveState
                                className={pageLinkClass(item === current)}
                                aria-current={item === current ? 'page' : undefined}
                            >
                                {item}
                            </Link>
                        </PaginationItem>
                    ),
                )}

                <PaginationItem>
                    {current >= last ? (
                        <span className={navBtnClass(true)} aria-disabled>
                            <span>Next</span>
                            <ChevronRight className="size-4" />
                        </span>
                    ) : (
                        <Link href={`/recruiter/students?page=${current + 1}`} preserveScroll preserveState className={navBtnClass(false)}>
                            <span>Next</span>
                            <ChevronRight className="size-4" />
                        </Link>
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
