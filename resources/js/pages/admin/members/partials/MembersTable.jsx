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
import { useEffect, useState } from 'react';

const MembersTable = ({ users, filter }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterUsers , setFilterUsers] = useState(users)
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filterUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filterUsers.length / itemsPerPage);
    useEffect(() => {
        const filtersUsers = users.filter(user => user.name.toLowerCase().includes(filter.search))
        setFilterUsers(filtersUsers)
    } , [filter])


    return (
        <div>
            <Table>
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
                    {currentItems?.map((user) => (
                        <TableRow key={user.id} className='cursor-pointer'>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-4">
                                    <div className="w-[40px] h-[40px] rounded-full bg-white"></div>
                                    <h1>{user.name}</h1>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell className="font-medium">{user.status}</TableCell>
                            <TableCell className="font-medium">{user.role}</TableCell>
                            <TableCell className="font-medium flex gap-2 items-center">
                                {/* Edit Button */}
                                <Link
                                    href={`/admin/members/${user.id}/edit`}
                                    className="p-2 transition-colors duration-200"
                                    title="Edit"
                                >
                                    <Pencil size={20} className='text-alpha' />
                                </Link>

                                {/* Delete Button */}
                                <Link
                                    href={`/admin/members/${user.id}`}
                                    method="delete"
                                    className="p-2 transition-colors duration-200"
                                    title="Delete"
                                    onBefore={() => confirm('Are you sure you want to delete this member?')}
                                >
                                    <Trash size={20} className='text-error cursor-pointer' />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* Pagination controls */}
            <div className="flex gap-5 mt-10 w-full items-center justify-center">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className='dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer'
                >
                    <ChevronsLeft />
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className='dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer'
                >
                    <ChevronsRight />
                </button>
            </div>
        </div>
    );
};

export default MembersTable;