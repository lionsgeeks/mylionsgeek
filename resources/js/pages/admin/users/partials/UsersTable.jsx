import { Link, router } from '@inertiajs/react';
import { Pencil, Trash, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleCheckBig, Camera, UsersRound, UsersRoundIcon, CameraIcon } from 'lucide-react';
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


const UsersTable = ({ users, filters, roles = [], trainings = [], status }) => {
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
    const [formData, setFormData] = useState({ name: '', email: '', role: '', status: '', formation_id: null, phone: '', cin: '', image: null });

    //! delete user
    // const handleDelete = (user) => {
    //     // router.delete(`/admin/users/delete/${id}`, {
    //     //     onFinish: () => {
    //     //         alert('success');
    //     //     },
    //     //     onError: () => {
    //     //         alert('error delete');
    //     //     },
    //     // });

    // };

    const openEdit = (user) => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || '',
            status: user.status || '',
            formation_id: user.formation_id || null,
            phone: user?.phone || '', // Make sure the value is initialized properly
            cin: user?.cin || '', // Make sure the value is initialized properly
            image: user?.image,
        });
        setOpenEditUser(user);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!openEditUser) return;
        router.post(`/admin/users/update/${openEditUser.id}`, {
            _method: 'put',
            ...formData,
        }, {
            forceFormData: true,
            onSuccess: () => setOpenEditUser(null),
            // onError: () => alert('ihave'),
        });
    };
    const changeAccountStatus = (user) => {
        // Toggle state: if account_state is 1, set it to 0, otherwise set it to 1
        const newState = user.account_state === 1 ? 0 : 1;

        // Send the PUT request with the new account_state
        router.post(`/admin/users/update/${user.id}/account-state`, {
            _method: 'put',  // This will mimic the PUT request method
            account_state: newState,  // Update only the account_state field
        }, {
            onSuccess: () => {
                // alert(`Account state updated from ${user.accoun} to ${newState}`);
                user.account_state = newState; // Update user state locally to reflect changes
            },

            onError: () => {
                // alert('Error updating account status');
            }
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
                                    <div className='flex flex-col'>
                                        <h1 className='capitalize'>{user.name}</h1>
                                        <span className='text-dark/80 dark:text-light/80 font-medium text-[0.8rem]'>{user.cin}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {/* Coworking Access Icon */}
                                        {user.access_cowork === 1 ? (
                                            <div className="relative group">
                                                <UsersRoundIcon
                                                    size={20}
                                                    className="text-alpha cursor-pointer transition-all duration-200 hover:text-primary"
                                                    aria-label="Coworking Access"
                                                />
                                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    Coworking Access
                                                </span>
                                            </div>
                                        ) : null}

                                        {/* Studio Access Icon */}
                                        {user.access_studio === 1 ? (
                                            <div className="relative group">
                                                <CameraIcon
                                                    size={20}
                                                    className="text-alpha cursor-pointer transition-all duration-200 hover:text-primary"
                                                    aria-label="Studio Access"
                                                />
                                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    Studio Access
                                                </span>
                                            </div>
                                        ) : null}

                                        {/* No Access Text */}
                                        {(user.access_studio === 0 && user.access_cowork === 0) && (
                                            <span className="dark:text-light text-dark text-sm">No Access</span>
                                        )}
                                    </div>
                                </TableCell>


                            </TableCell>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell className="font-medium">{user.status}</TableCell>
                            <TableCell className="font-medium">{user.role}</TableCell>
                            <TableCell className="font-medium flex gap-2 items-center">
                                {/* Edit Button */}
                                <Button
                                    className="p-2 bg-transparent hover:bg-transparent duration-200"
                                    title="Edit"
                                    onClick={() => openEdit(user)}
                                >
                                    <Pencil size={20} className='text-alpha' />
                                </Button>

                                {/* Delete Button */}
                                <Button
                                    className="p-2 bg-transparent hover:bg-transparent duration-200 cursor-pointer"
                                    title={user.account_state ? 'Active' : 'Suspend'}
                                    onClick={() => changeAccountStatus(user)}
                                >
                                    {user.account_state ? (
                                        <>
                                            <CircleCheckBig size={25} className='text-green-600' />
                                        </>
                                    ) : (
                                        <>
                                            <Trash size={25} className='text-error' />
                                        </>
                                    )}
                                </Button>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* <DeleteModal
            // !delete modal
                open={openDeleteId !== null}
                onOpenChange={(open) => !open && setOpenDeleteId(null)}
                title="Delete user"
                description="This action cannot be undone. The user will be permanently deleted."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => openDeleteId ? handleDelete(openDeleteId) : undefined}
            /> */}
            {/* Edit Modal */}
            <Dialog open={!!openEditUser} onOpenChange={(open) => !open && setOpenEditUser(null)}>
                <DialogContent className="sm:max-w-[720px] bg-light text-dark dark:bg-dark dark:text-light">
                    <DialogHeader>
                        <DialogTitle>Modify user</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Avatar Section */}
                        <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4 mb-4">
                            <div className="relative w-24 h-24">
                                {/* Avatar Image */}
                                <Avatar className="w-24 h-24 rounded-full overflow-hidden">
                                    {(formData.image && formData.image instanceof File) ? (
                                        <AvatarImage src={formData.image} alt="User Avatar" />
                                    ) : (
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(formData.name)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>


                                {/* Upload Button Overlay */}
                                <label className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-alpha rounded-full cursor-pointer border-2 border-white hover:bg-alpha/80">
                                    <ImagePlus size={18} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="col-span-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="cin">Cin</Label>
                            <Input
                                id="cin"
                                type="cin"
                                value={formData.cin}
                                onChange={e => setFormData({ ...formData, cin: e.target.value })}
                            />
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
                            <Select
                                value={formData.status ? String(formData.status) : ''}
                                onValueChange={v => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select training" />
                                </SelectTrigger>
                                <SelectContent>
                                    {status.map((s, idx) => (
                                        <SelectItem key={idx} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Label>Training</Label>
                            <Select
                                value={formData.formation_id ? String(formData.formation_id) : ''}
                                onValueChange={v => setFormData({ ...formData, formation_id: Number(v) })}
                            >
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

                        {/* Buttons */}
                        <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                            <Button type="button" variant="secondary" className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark" onClick={() => setOpenEditUser(null)}>
                                Cancel
                            </Button>
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