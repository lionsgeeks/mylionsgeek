import React, { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Minus, Pencil, Search } from 'lucide-react';

function findUserById(users, id) {
    return users.find(u => u.id === id) || null;
}

export default function ComputersIndex({ computers: computersProp = [], users: usersProp = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [query, setQuery] = useState('');
    const [computers, setComputers] = useState(computersProp);
    const [users] = useState(usersProp);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTargetId, setAssignTargetId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [damaged, setDamaged] = useState('all'); // all | damaged | working
    const [assigned, setAssigned] = useState('all'); // all | assigned | unassigned
    const [userFilter, setUserFilter] = useState('all'); // all | userId
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ reference: '', cpu: '', gpu: '', state: '', user_id: null, start: '', end: '', mark: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTargetId, setEditTargetId] = useState(null);
    const [editForm, setEditForm] = useState({ reference: '', cpu: '', gpu: '', state: '', user_id: null, start: '', end: '', mark: '' });

    const filteredComputers = useMemo(() => {
        let list = computers;
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(c =>
                [
                    c.cpu,
                    c.gpu,
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

        if (userFilter !== 'all') {
            const uid = Number(userFilter);
            list = list.filter(c => c.assignedUserId === uid);
        }

        return list;
    }, [computers, query, users, damaged, assigned, userFilter]);

    function openAssignModal(computerId) {
        setAssignTargetId(computerId);
        setSelectedUserId(null);
        setShowAssignModal(true);
    }

    function assignComputer() {
        if (!assignTargetId || !selectedUserId) return;
        setComputers(prev =>
            prev.map(c =>
                c.id === assignTargetId
                    ? { ...c, assignedUserId: selectedUserId }
                    : c
            )
        );
        setShowAssignModal(false);
    }

    function dissociateComputer(computerId) {
        setComputers(prev =>
            prev.map(c => (c.id === computerId ? { ...c, assignedUserId: null } : c))
        );
    }

    function openAddModal() {
        setAddForm({ reference: '', cpu: '', gpu: '', state: 'working', user_id: null, start: '', end: '', mark: '' });
        setShowAddModal(true);
    }

    function addComputer() {
        router.post('/admin/computers', addForm, {
            onSuccess: () => {
                setShowAddModal(false);
                // Refresh the page to get updated data
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
        router.put(`/admin/computers/${editTargetId}`, editForm, {
            onSuccess: () => {
                setShowEditModal(false);
                // Refresh the page to get updated data
                router.reload();
            }
        });
    }

    function Header() {
        return (
            <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Computers</h1>
                        <p className="text-sm text-muted-foreground mt-2">{computers.length} total</p>
                    </div>
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={openAddModal}>Add Computer</Button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search"
                            value={query}
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

                    <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="User" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {users.map(u => (
                                <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
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
                            <TableHead>Menu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredComputers.map(c => {
                            const user = findUserById(users, c.assignedUserId);
                            return (
                                <TableRow key={c.id} className="">
                                    <TableCell className="font-medium">{c.cpu}</TableCell>
                                    <TableCell>{c.gpu}</TableCell>
                                    <TableCell>
                                        {user ? (
                                            <div className="flex items-center gap-2 w-10">
                                                <span>{user.name}</span>
                                                <Button
                                                    size={18}
                                                    onClick={() => dissociateComputer(c.id)}
                                                    className="p-1 bg-white text-black  transition-colors duration-200"
                                                    aria-label="Dissociate"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" className="bg-white" onClick={() => openAssignModal(c.id)}>Assign</Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex gap-2 items-center">
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="bg-alpha hover:bg-yellow-600 p-2 rounded-full transition-colors duration-200"
                                            title="Edit"
                                        >
                                            <Pencil size={18} color="#fff" />
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
    // computer history
    function renderHistoryTable() {
        return (
            <div className="border rounded p-6 text-sm text-gray-600"></div>
        );
    }

    return (
        <AppLayout>
            <Head title="Computers" />
            <div className="p-6 md:p-10">
                <Header />

                <div className="flex items-center gap-2 mb-6">
                    <Button variant={activeTab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('all')}>All Computers</Button>
                    <Button variant={activeTab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('history')}>Computers History</Button>
                </div>

                {activeTab === 'history' ? renderHistoryTable() : renderAllTable()}
            </div>

            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Computer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input placeholder="Search users... (static list)" readOnly />
                        <div className="max-h-64 overflow-auto border rounded">
                            {users.map(u => (
                                <label key={u.id} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{u.name}</span>
                                        <span className="text-xs text-gray-500">{u.email}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="user"
                                        checked={selectedUserId === u.id}
                                        onChange={() => setSelectedUserId(u.id)}
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                            <Button onClick={assignComputer} disabled={!selectedUserId}>Assign</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                            <Select value={addForm.gpu} onValueChange={value => setAddForm(f => ({ ...f, gpu: value }))}>
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
                            <Select value={addForm.state} onValueChange={value => setAddForm(f => ({ ...f, state: value }))}>
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
                            <Input value={addForm.mark} onChange={e => setAddForm(f => ({ ...f, mark: e.target.value }))} placeholder="Mark" />
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

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Computer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1">Reference :</label>
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
                            <Select value={editForm.state} onValueChange={value => setEditForm(f => ({ ...f, state: value }))}>
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
                            <label className="block text-sm mb-1">Start Date :</label>
                            <Input type="date" value={editForm.start} onChange={e => setEditForm(f => ({ ...f, start: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End Date :</label>
                            <Input type="date" value={editForm.end} onChange={e => setEditForm(f => ({ ...f, end: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button onClick={updateComputer}>Update Computer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}


