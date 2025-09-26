import { Link, router } from '@inertiajs/react';
import { Pencil, Trash, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import DeleteModal from '@/components/DeleteModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus } from 'lucide-react';


const UsersTable = ({ users, filters, roles = [], trainings = [] }) => {
    const getInitials = useInitials();
    const [currentPage, setCurrentPage] = useState(1);
    const [filterUsers, setFilterUsers] = useState(users)
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filterUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filterUsers.length / itemsPerPage);
    useEffect(() => {
        setFilterUsers(users);
        setCurrentPage(1);
    }, [users]);

    const [openDeleteId, setOpenDeleteId] = useState(null);
    const [openEditUser, setOpenEditUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: '', status: '', formation_id: null, image: null });

    const handleDelete = (id) => {
        return new Promise((resolve) => {
            router.delete(`/admin/users/${id}`, {
                onFinish: () => {
                    resolve();
                }
            });
        });
    };

    const openEdit = (user) => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || '',
            status: user.status || '',
            formation_id: user.formation_id || null,
            image: null,
        });
        setOpenEditUser(user);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!openEditUser) return;
        router.post(`/admin/users/${openEditUser.id}`, {
            _method: 'put',
            ...formData,
        }, {
            forceFormData: true,
            onSuccess: () => setOpenEditUser(null),
        });
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Members</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Menu</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems?.map((user) => (
                        <TableRow key={user.id} className='cursor-pointer'>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-4">
                                    {
                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    }
                                    <h1>{user.name}</h1>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell className="font-medium">{user.status}</TableCell>
                            <TableCell className="font-medium">{user.role}</TableCell>
                            <TableCell className="font-medium flex gap-2 items-center">
                                {/* Edit Button */}
                                <button
                                    type="button"
                                    className="p-2 transition-colors duration-200"
                                    title="Edit"
                                    onClick={() => openEdit(user)}
                                >
                                    <Pencil size={20} className='text-alpha' />
                                </button>

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    className="p-2 transition-colors duration-200"
                                    title="Delete"
                                    onClick={() => setOpenDeleteId(user.id)}
                                >
                                    <Trash size={20} className='text-error cursor-pointer' />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <DeleteModal
                open={openDeleteId !== null}
                onOpenChange={(open) => !open && setOpenDeleteId(null)}
                title="Delete user"
                description="This action cannot be undone. The user will be permanently deleted."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => openDeleteId ? handleDelete(openDeleteId) : undefined}
            />
            {/* Edit Modal */}
            <Dialog open={!!openEditUser} onOpenChange={(open) => !open && setOpenEditUser(null)}>
                <DialogContent className="sm:max-w-[720px] bg-light text-dark dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle>Modify user</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="col-span-1">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <Label>Role</Label>
                            <Select value={formData.role || ''} onValueChange={v => setFormData({ ...formData, role: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role, idx) => (
                                        <SelectItem key={idx} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1">
                            <Label>Status</Label>
                            <Input value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Label>Training</Label>
                            <Select value={formData.formation_id ? String(formData.formation_id) : ''} onValueChange={v => setFormData({ ...formData, formation_id: Number(v) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select training" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trainings.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Label>Avatar</Label>
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-alpha px-3 py-2 hover:bg-alpha/10 dark:hover:bg-beta/20">
                                    <ImagePlus size={18} />
                                    <span>Upload new</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                                </label>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                            <Button type="button" variant="secondary" className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark" onClick={() => setOpenEditUser(null)}>Cancel</Button>
                            <Button type="submit" className="bg-alpha text-light hover:bg-alpha/90">Save changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
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

export default UsersTable;