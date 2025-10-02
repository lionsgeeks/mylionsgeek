import React, { useMemo, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Route, Search, Trash } from 'lucide-react';

function findUserById(users, id) {
    return users.find(u => u.id === id) || null;
}

export default function ComputersIndex({ computers: computersProp = [], users: usersProp = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [query, setQuery] = useState('');
    const [computers, setComputers] = useState(computersProp);
    const [users] = useState(usersProp);
    const [damaged, setDamaged] = useState('all');
    const [assigned, setAssigned] = useState('all');
    const searchInputRef = useRef(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ reference: '', cpu: '', gpu: '', state: '', user_id: null, start: '', end: '', mark: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTargetId, setEditTargetId] = useState(null);
    const [editForm, setEditForm] = useState({ reference: '', cpu: '', gpu: '', state: '', user_id: null, start: '', end: '', mark: '' });
    const [userSearch, setUserSearch] = useState('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingComputer, setDeletingComputer] = useState(null);

    const filteredComputers = useMemo(() => {
        let list = computers;
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(c =>
                [
                    c.reference || '',
                    c.cpu || '',
                    c.gpu || '',
                    findUserById(users, c.assignedUserId)?.name || ''
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(q)
            );
        }

        if (damaged !== 'all') {
            const wantDamaged = damaged === 'damaged';
            list = list.filter(c => (wantDamaged ? c.isBroken : !c.isBroken));
        }

        if (assigned !== 'all') {
            const wantAssigned = assigned === 'assigned';
            list = list.filter(c => (wantAssigned ? !!c.assignedUserId : !c.assignedUserId));
        }

        return list;
    }, [computers, query, users, damaged, assigned]);

    function resetFilters() {
        setQuery('');
        setDamaged('all');
        setAssigned('all');
        if (searchInputRef.current) {
            searchInputRef.current.value = '';
            try { searchInputRef.current.focus(); } catch { }
        }
    }

    function openAddModal() {
        setAddForm({ reference: '', cpu: '', gpu: '', state: 'working', user_id: null, start: '', end: '', mark: '' });
        setShowAddModal(true);
    }

    function addComputer() {
        router.post('/admin/computers', addForm, {
            onSuccess: () => {
                setShowAddModal(false);
                router.reload();
            }
        });
    }

    function openEditModal(computer) {
        setEditTargetId(computer.id);
        setEditForm({
            reference: computer.reference || '',
            cpu: computer.cpu || '',
            gpu: computer.gpu || '',
            state: computer.isBroken ? 'not_working' : 'working',
            user_id: computer.assignedUserId || null,
            start: computer.contractStart || '',
            end: computer.contractEnd || '',
            mark: computer.mark || '',
        });
        setShowEditModal(true);
    }

    function updateComputer() {
        if (!editTargetId) return;
        const payload = { ...editForm };
        if (payload.user_id === null) {
            delete payload.user_id;
        }
        router.put(`/admin/computers/${editTargetId}`, payload, {
            onSuccess: () => {
                setComputers(prev =>
                    prev.map(c => {
                        if (c.id === editTargetId) {
                            return {
                                ...c,
                                assignedUserId: editForm.user_id || null,
                                reference: editForm.reference,
                                cpu: editForm.cpu,
                                gpu: editForm.gpu,
                                isBroken: editForm.state !== 'working',
                                contractStart: editForm.start,
                                contractEnd: editForm.end,
                                mark: editForm.mark
                            };
                        }
                        return c;
                    })
                );
                setShowEditModal(false);
            }
        });
    }
    function handleDelete(computer) {
        setDeletingComputer(computer);
        setIsDeleteOpen(true);
    };
    function deleteComputer() {
        if (deletingComputer) {
            router.delete(`/admin/computers/${deletingComputer.id}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setComputers(prev => prev.filter(c => c.id !== deletingComputer.id));
                    setDeletingComputer(null);
                    console.log("Deleted successfully")
                }
            })
        }
    }


    function renderAllTable() {
        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableCaption>A list of your computers.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Serial number</TableHead>
                            <TableHead>CPU/GPU</TableHead>
                            <TableHead>Assign</TableHead>
                            <TableHead>	Start Contract</TableHead>
                            <TableHead>Menu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredComputers.map(c => {
                            const user = findUserById(users, c.assignedUserId);
                            return (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.cpu}</TableCell>
                                    <TableCell>{c.gpu}</TableCell>

                                    <TableCell>
                                        {user ? (
                                            <span className="text-sm font-medium">{user.name}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">Not assigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user ? (
                                            <span className="text-sm font-medium">
                                                <Button onClick={() => {
                                                    window.location.href = `/admin/computers/${c.id}/contract`;
                                                }}>
                                                    Download
                                                </Button></span>
                                        ) : (
                                            <span className="text-sm text-gray-500">Not assigned</span>
                                        )}

                                    </TableCell>
                                    <TableCell className="flex gap-2 items-center">
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="p-2 bg-transparent hover:bg-transparent duration-200"
                                            title="Edit"
                                        >
                                            <Pencil size={18} className="text-alpha" />
                                        </button>

                                        <button
                                            className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-red-600 cursor-pointer"
                                            title="Delete"
                                            variant="destructive" onClick={() => handleDelete(c)}
                                        >
                                            <Trash size={18} className="text-error"/>
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }

    function renderHistoryTable() {
        return (
            <div className="border rounded p-6 text-sm text-gray-600"></div>
        );
    }

    return (
        <AppLayout>
            <Head title="Computers" />
            <div className="p-6 md:p-10">

                {/* Inlined Header JSX */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Computers</h1>
                            <p className="text-sm text-muted-foreground mt-2">{computers.length} total</p>
                        </div>
                        <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={openAddModal}>
                            Add Computer
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search"
                                ref={searchInputRef}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>

                        <Select value={damaged} onValueChange={setDamaged}>
                            <SelectTrigger>
                                <SelectValue placeholder="Damaged" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Damaged: All</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={assigned} onValueChange={setAssigned}>
                            <SelectTrigger>
                                <SelectValue placeholder="Assigned" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Assigned: All</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    </div>
                </div>
                {/* End Header */}

                <div className="flex items-center gap-2 mb-6">
                    <Button variant={activeTab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('all')}>All Computers</Button>
                    <Button variant={activeTab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('history')}>Computers History</Button>
                </div>

                {activeTab === 'history' ? renderHistoryTable() : renderAllTable()}
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a Computer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1">Reference :</label>
                            <Input value={addForm.reference} onChange={e => setAddForm(f => ({ ...f, reference: e.target.value }))} placeholder="reference" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Serial Number :</label>
                            <Input value={addForm.cpu} onChange={e => setAddForm(f => ({ ...f, cpu: e.target.value }))} placeholder="Serial number" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">CPU-GPU :</label>
                            <Select
                                value={addForm.gpu}
                                onValueChange={value => setAddForm(f => ({ ...f, gpu: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select CPU-GPU" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="I5-GTX">I5-GTX</SelectItem>
                                    <SelectItem value="I7-RTX">I7-RTX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Computer State :</label>
                            <Select
                                value={addForm.state}
                                onValueChange={value => setAddForm(f => ({ ...f, state: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="working">Working</SelectItem>
                                    <SelectItem value="not_working">Not Working</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Mark :</label>
                            <Input
                                value={addForm.mark}
                                onChange={e => setAddForm(f => ({ ...f, mark: e.target.value }))}
                                placeholder="Mark"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-sm mb-1">Start Date :</label>
                            <Input type="date" value={addForm.start} onChange={e => setAddForm(f => ({ ...f, start: e.target.value }))} />
                        </div> */}

                        {/* <div>
                            <label className="block text-sm mb-1">End Date :</label>
                            <Input type="date" value={addForm.end} onChange={e => setAddForm(f => ({ ...f, end: e.target.value }))} />
                        </div> */}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button onClick={addComputer}>Add Computer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Computer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div> <label className="block text-sm mb-1">Reference :</label>
                            <Input value={editForm.reference} onChange={e => setEditForm(f => ({ ...f, reference: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Serial Number :</label>
                            <Input value={editForm.cpu} onChange={e => setEditForm(f => ({ ...f, cpu: e.target.value }))} placeholder="Serial number" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">CPU-GPU :</label>
                            <Select value={editForm.gpu} onValueChange={value => setEditForm(f => ({ ...f, gpu: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select CPU-GPU" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="I5-GTX">I5-GTX</SelectItem>
                                    <SelectItem value="I7-RTX">I7-RTX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Computer State :</label>
                            <Select
                                value={editForm.state}
                                onValueChange={value => setEditForm(f => ({ ...f, state: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="working">Working</SelectItem>
                                    <SelectItem value="not_working">Not Working</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Mark :</label>
                            <Input value={editForm.mark} onChange={e => setEditForm(f => ({ ...f, mark: e.target.value }))} placeholder="Mark" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Assign to User :</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Search user by name or email"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                    />

                                    {/* Dissociate button */}
                                    {editForm.user_id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (!editTargetId) return;
                                                setEditForm(f => ({ ...f, user_id: null }));
                                                setComputers(prev =>
                                                    prev.map(c =>
                                                        c.id === editTargetId ? { ...c, assignedUserId: null } : c
                                                    )
                                                );
                                                router.put(`/admin/computers/${editTargetId}`, { ...editForm, user_id: null }, {
                                                    onSuccess: () => {
                                                        setShowEditModal(false);
                                                    },
                                                    onError: err => console.error('Failed to dissociate:', err)
                                                });
                                            }}
                                        >
                                            Dissociate
                                        </Button>

                                    )}
                                </div>

                                {/* Show selected user */}
                                {editForm.user_id && (
                                    <p className="text-xs text-muted-foreground">
                                        Selected: {findUserById(users, editForm.user_id)?.name || 'Unknown'}
                                    </p>
                                )}

                                {/* Search results */}
                                {userSearch.trim() && (
                                    <div className="max-h-48 overflow-auto border rounded">
                                        {users
                                            .filter(u => {
                                                const q = userSearch.trim().toLowerCase();
                                                return (
                                                    u.name.toLowerCase().includes(q) ||
                                                    (u.email || '').toLowerCase().includes(q)
                                                );
                                            })
                                            .slice(0, 12)
                                            .map(u => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!editTargetId) return;
                                                        setEditForm(f => ({ ...f, user_id: u.id }));
                                                        setComputers(prev =>
                                                            prev.map(c =>
                                                                c.id === editTargetId ? { ...c, assignedUserId: u.id } : c
                                                            )
                                                        );
                                                        router.put(`/admin/computers/${editTargetId}`, { user_id: u.id }, {
                                                            onError: err => console.error('Failed to assign user:', err)
                                                        });
                                                        setUserSearch(u.name);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-muted ${editForm.user_id === u.id ? 'bg-muted' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-sm">{u.name}</span>
                                                        <span className="text-xs text-gray-500">{u.email}</span>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* <div>
                            <label className="block text-sm mb-1">Start Date :</label>
                            <Input type="date" value={editForm.start} onChange={e => setEditForm(f => ({ ...f, start: e.target.value }))} />
                        </div> */}

                        {/* <div>
                            <label className="block text-sm mb-1">End Date :</label>
                            <Input type="date" value={editForm.end} onChange={e => setEditForm(f => ({ ...f, end: e.target.value }))} />
                        </div> */}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button onClick={updateComputer}>Update Computer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>



            {/* Delete confirmation modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                            <div>
                                <h2 className="text-lg font-semibold">Delete Computer</h2>
                                <p className="text-sm text-muted-foreground">
                                    This action cannot be undone.
                                </p>
                            </div></DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {deletingComputer && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="flex items-center gap-3">

                                    <div>
                                        <p className="font-medium">{deletingComputer.reference}</p>
                                        <p className="text-sm text-muted-foreground">{deletingComputer.mark}</p>
                                        <p className="text-sm text-muted-foreground">{deletingComputer.cpu}</p>
                                        <p className="text-sm text-muted-foreground">{deletingComputer.gpu}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setDeletingComputer(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={deleteComputer}
                            >
                                Delete Computer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
