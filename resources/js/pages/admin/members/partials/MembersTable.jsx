import { Link } from '@inertiajs/react';
import { Pencil, Trash, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const MembersTable = ({ paginateMembers }) => {
    const members = paginateMembers.data;
    const pagination = paginateMembers;

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent members.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Members</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Menu</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members?.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-4">
                                    <div className="w-[40px] h-[40px] rounded-full bg-white"></div>
                                    <h1>{member.name}</h1>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell className="font-medium">{member.email}</TableCell>
                            <TableCell className="font-medium">{member.status}</TableCell>
                            <TableCell className="font-medium">{member.role}</TableCell>
                            <TableCell className="font-medium flex gap-2 items-center">
                                {/* Edit Button */}
                                <Link
                                    href={`/admin/members/${member.id}/edit`}
                                    className="bg-alpha hover:bg-yellow-600 p-2 rounded-full transition-colors duration-200"
                                    title="Edit"
                                >
                                    <Pencil size={18} color="#fff" />
                                </Link>

                                {/* Delete Button */}
                                <Link
                                    href={`/admin/members/${member.id}`}
                                    method="delete"
                                    as="button"
                                    className="bg-error hover:bg-red-600 p-2 rounded-full transition-colors duration-200"
                                    title="Delete"
                                    onBefore={() => confirm('Are you sure you want to delete this member?')}
                                >
                                    <Trash size={18} color="#fff" />
                                </Link>

                                {/* View Button */}
                                <Link
                                    href={`/admin/members/${member.id}`}
                                    className="darkbg-light hover:bg-gray-300 p-2 rounded-full transition-colors duration-200 bg-dark"
                                    title="View"
                                >
                                    <Eye size={18}  className='text-white dark:text-dark' />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Enhanced Pagination Component */}
            <div className="mt-8 bg-light dark:bg-dark rounded-lg shadow-sm">
                <div className="px-4 py-3 sm:px-6">
                    {/* Results Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
                        {/* <div className="text-sm text-gray-700">
                            <span className="font-medium">Showing</span>{' '}
                            <span className="font-semibold text-gray-900">{pagination.from}</span>{' '}
                            <span className="font-medium">to</span>{' '}
                            <span className="font-semibold text-gray-900">{pagination.to}</span>{' '}
                            <span className="font-medium">of</span>{' '}
                            <span className="font-semibold text-gray-900">{pagination.total}</span>{' '}
                            <span className="font-medium">results</span>
                        </div> */}

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-center sm:justify-end">
                            <nav className="flex items-center space-x-2" aria-label="Pagination">
                                {/* First Page Button */}
                                {/* {pagination.current_page > 2 && (
                                    <Link
                                        href={pagination.links?.[0]?.url}
                                        className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                        preserveScroll
                                        title="First page"
                                    >
                                        <ChevronsLeft size={16} />
                                        <span className="sr-only">First page</span>
                                    </Link>
                                )} */}

                    {/* Previous Button */}
                    {pagination.prev_page_url ? (
                        <Link
                            href={pagination.prev_page_url}
                                        className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700   transition-all duration-200 shadow-sm hover:shadow-md"
                            preserveScroll
                                        title="Previous page"
                        >
                            <ChevronLeft size={16} />
                                        <span className="sr-only">Previous</span>
                        </Link>
                    ) : (
                                    <span className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-300 dark:text-gray-500 bg-gray-50 dark:bg-gray-800  rounded-lg cursor-not-allowed">
                            <ChevronLeft size={16} />
                                        <span className="sr-only">Previous</span>
                        </span>
                    )}

                    {/* Page Numbers */}
                                <div className="hidden sm:flex items-center space-x-2">
                                    {(() => {
                                        const links = pagination.links?.slice(1, -1) || [];
                                        const currentPage = pagination.current_page;
                                        const totalPages = pagination.last_page;

                                        // Smart pagination logic
                                        if (totalPages <= 7) {
                                            // Show all pages if 7 or fewer
                                            return links.map((link, index) => (
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                                        className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-all duration-200  rounded-lg ${link.active
                                                                ? 'z-10 bg-alpha text-white  shadow-md'
                                                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800  hover:bg-gray-50 dark:hover:bg-gray-700  shadow-sm hover:shadow-md'
                                    }`}
                                preserveScroll
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span
                                key={index}
                                                        className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800  rounded-lg cursor-not-allowed"
                            >
                                {link.label}
                            </span>
                        )
                                            ));
                                        } else {
                                            // Smart pagination with ellipsis
                                            const pages = [];
                                            const showEllipsis = totalPages > 7;

                                            // Always show first page
                                            if (currentPage > 4) {
                                                pages.push(
                                                    <Link
                                                        key="first"
                                                        href={pagination.links?.[1]?.url}
                                                        className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700  transition-all duration-200  shadow-sm hover:shadow-md"
                                                        preserveScroll
                                                    >
                                                        1
                                                    </Link>
                                                );

                                                if (currentPage > 5) {
                                                    pages.push(
                                                        <span key="ellipsis1" className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                            }

                                            // Show pages around current page
                                            const start = Math.max(1, currentPage - 2);
                                            const end = Math.min(totalPages, currentPage + 2);

                                            for (let i = start; i <= end; i++) {
                                                const isActive = i === currentPage;
                                                const link = links.find(l => parseInt(l.label) === i);

                                                if (link?.url) {
                                                    pages.push(
                                                        <Link
                                                            key={i}
                                                            href={link.url}
                                                            className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-all duration-200  rounded-lg ${isActive
                                                                    ? 'z-10 bg-alpha text-white  shadow-md'
                                                                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800  hover:bg-gray-50 dark:hover:bg-gray-700  shadow-sm hover:shadow-md'
                                                                }`}
                                                            preserveScroll
                                                        >
                                                            {i}
                                                        </Link>
                                                    );
                                                } else {
                                                    pages.push(
                                                        <span
                                                            key={i}
                                                            className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800  rounded-lg cursor-not-allowed"
                                                        >
                                                            {i}
                                                        </span>
                                                    );
                                                }
                                            }

                                            // Always show last page
                                            if (currentPage < totalPages - 3) {
                                                if (currentPage < totalPages - 4) {
                                                    pages.push(
                                                        <span key="ellipsis2" className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                const lastLink = links.find(l => parseInt(l.label) === totalPages);
                                                if (lastLink?.url) {
                                                    pages.push(
                                                        <Link
                                                            key="last"
                                                            href={lastLink.url}
                                                            className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700  transition-all duration-200  shadow-sm hover:shadow-md"
                                                            preserveScroll
                                                        >
                                                            {totalPages}
                                                        </Link>
                                                    );
                                                }
                                            }

                                            return pages;
                                        }
                                    })()}
                                </div>

                                {/* Mobile Page Info */}
                                <div className="sm:hidden flex items-center justify-center w-20 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800  rounded-lg">
                                    {pagination.current_page}/{pagination.last_page}
                                </div>

                                {/* Next Button */}
                                {pagination.next_page_url ? (
                                    <Link
                                        href={pagination.next_page_url}
                                        className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700   transition-all duration-200 shadow-sm hover:shadow-md"
                                        preserveScroll
                                        title="Next page"
                                    >
                                        <ChevronRight size={16} />
                                        <span className="sr-only">Next</span>
                                    </Link>
                                ) : (
                                    <span className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-300 dark:text-gray-500 bg-gray-50 dark:bg-gray-800  rounded-lg cursor-not-allowed">
                                        <ChevronRight size={16} />
                                        <span className="sr-only">Next</span>
                                    </span>
                                )}

                                {/* Last Page Button */}
                                {/* {pagination.current_page < pagination.last_page - 1 && (
                                    <Link
                                        href={pagination.links?.[pagination.links.length - 1]?.url}
                                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        preserveScroll
                                        title="Last page"
                                    >
                                        <ChevronsRight size={16} />
                                        <span className="sr-only">Last page</span>
                                    </Link>
                                )} */}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembersTable;