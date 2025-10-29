import Banner from '@/components/banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Activity, AlertCircle, History, MessageSquare, Package, Pencil, Settings, Trash, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import illustration from '../../../../../public/assets/images/banner/Camera-amico.png';

const EquipmentIndex = ({ equipment = [], types = [] }) => {
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [deletingEquipment, setDeletingEquipment] = useState(null);
    const [filterType, setFilterType] = useState('all');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterState, setFilterState] = useState('all');
    const [page, setPage] = useState(1);
    const [showAll, setShowAll] = useState(false);
    const perPage = 10;
    // History modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyEquipment, setHistoryEquipment] = useState(null);
    const [historyItems, setHistoryItems] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyTab, setHistoryTab] = useState('usage'); // usage, notes
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

    // Type management state
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [deletingType, setDeletingType] = useState(null);
    const [isTypeDeleteOpen, setIsTypeDeleteOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        mark: '',
        reference: '',
        equipment_type: '',
        other_type: '',
        state: 1,
        image: null,
    });
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        reset: resetEdit,
        errors: editErrors,
    } = useForm({
        mark: '',
        reference: '',
        equipment_type: '',
        other_type: '',
        state: 1,
        image: null,
    });

    // Type management form
    const {
        data: typeData,
        setData: setTypeData,
        post: postType,
        put: putType,
        processing: typeProcessing,
        reset: resetType,
        errors: typeErrors,
    } = useForm({
        name: '',
    });

    // Note form
    const {
        data: noteData,
        setData: setNoteData,
        post: postNote,
        processing: noteProcessing,
        reset: resetNote,
        errors: noteErrors,
    } = useForm({
        note: '',
        type: 'general',
    });

    const handleEdit = (equipment) => {
        // Set the equipment being edited
        setEditingEquipment(equipment);

        // Populate form with current equipment data
        setEditData({
            mark: equipment.mark || '',
            reference: equipment.reference || '',
            equipment_type: equipment.equipment_type || '',
            other_type: '',
            state: equipment.state ? 1 : 0,
            image: null,
        });

        // Open the modal
        setIsEditOpen(true);
    };

    const handleDelete = (equipment) => {
        setDeletingEquipment(equipment);
        setIsDeleteOpen(true);
    };

    const openHistory = async (equipment) => {
        setHistoryEquipment(equipment);
        setIsHistoryOpen(true);
        setIsLoadingHistory(true);
        try {
            const [usageRes, notesRes] = await Promise.all([
                fetch(`/admin/equipements/${equipment.id}/usage-activities`),
                fetch(`/admin/equipements/${equipment.id}/notes`),
            ]);

            const usageData = usageRes.ok ? await usageRes.json() : { usage_activities: [] };
            const notesData = notesRes.ok ? await notesRes.json() : { notes: [] };

            const combinedHistory = [
                ...usageData.usage_activities.map((item) => ({ ...item, type: 'usage' })),
                ...notesData.notes.map((item) => ({ ...item, type: 'note' })),
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setHistoryItems(combinedHistory);
        } catch (err) {
            console.error(err);
            setHistoryItems([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleAddNote = () => {
        if (!noteData.note.trim() || !historyEquipment) return;

        postNote(``, {
            onSuccess: () => {
                resetNote();
                setIsAddNoteOpen(false);
                openHistory(historyEquipment);
            },
            onError: (errors) => {
                console.log('Note validation errors:', errors);
            },
        });
    };

    const handleUpdateEquipment = () => {
        put(`/admin/equipements/${editingEquipment.id}`, {
            onSuccess: () => {
                resetEdit();
                setIsEditOpen(false);
                setEditingEquipment(null);
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleAddEquipment = () => {
        // Validate required fields on frontend first
        if (!data.mark || !data.reference || !data.equipment_type) {
            return;
        }

        post('/admin/equipements', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setIsAddOpen(false);
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    // Type management functions
    const loadEquipmentTypes = async () => {
        setIsLoadingTypes(true);
        try {
            const response = await fetch('/admin/equipment-types');
            const data = await response.json();
            setEquipmentTypes(data);
        } catch (error) {
            console.error('Failed to load equipment types:', error);
        } finally {
            setIsLoadingTypes(false);
        }
    };

    const openTypeManager = () => {
        setIsTypeManagerOpen(true);
        loadEquipmentTypes();
    };

    const handleAddType = () => {
        if (!typeData.name.trim()) return;

        postType('/admin/equipment-types', {
            onSuccess: () => {
                resetType();
                loadEquipmentTypes(); // Refresh the list
            },
            onError: (errors) => {
                console.log('Type validation errors:', errors);
            },
        });
    };

    const handleEditType = (type) => {
        setEditingType(type);
        setTypeData('name', type.name);
    };

    const handleUpdateType = () => {
        if (!typeData.name.trim() || !editingType) return;

        putType(`/admin/equipment-types/${editingType.id}`, {
            onSuccess: () => {
                resetType();
                setEditingType(null);
                loadEquipmentTypes(); // Refresh the list
            },
            onError: (errors) => {
                console.log('Type validation errors:', errors);
            },
        });
    };

    const handleDeleteType = (type) => {
        setDeletingType(type);
        setIsTypeDeleteOpen(true);
    };

    const confirmDeleteType = () => {
        if (!deletingType) return;

        router.delete(`/admin/equipment-types/${deletingType.id}`, {
            onSuccess: () => {
                loadEquipmentTypes(); // Refresh the list
                setIsTypeDeleteOpen(false);
                setDeletingType(null);
            },
            onError: (errors) => {
                console.error('Failed to delete type:', errors);
            },
        });
    };

    const confirmDelete = () => {
        if (deletingEquipment) {
            router.delete(`/admin/equipements/${deletingEquipment.id}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeletingEquipment(null);
                },
            });
        }
    };

    // Ensure 'other' exists in the type list and build options
    const baseTypes = Array.from(new Set([...(types || []), 'other'])).sort();
    // For the Add modal, we want 'other' to always be last
    const addModalTypes = [...baseTypes.filter((t) => t !== 'other'), 'other'];

    // Filter equipment
    const filteredEquipment = useMemo(() => {
        const typeMatch = (e) => {
            if (filterType === 'all') return true;
            return e.equipment_type === filterType;
        };

        const stateMatch = (e) => {
            if (filterState === 'all') return true;
            if (filterState === 'working') return e.state === true;
            if (filterState === 'not_working') return e.state === false;
            return true;
        };

        const searchMatch = (e) => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                e.reference?.toLowerCase().includes(term) || e.mark?.toLowerCase().includes(term) || e.equipment_type?.toLowerCase().includes(term)
            );
        };

        return equipment.filter((e) => typeMatch(e) && stateMatch(e) && searchMatch(e));
    }, [equipment, searchTerm, filterType, filterState]);

    // Pagination
    const pagedEquipment = showAll ? filteredEquipment : filteredEquipment.slice((page - 1) * perPage, page * perPage);

    const totalPages = showAll ? 1 : Math.ceil(filteredEquipment.length / perPage) || 1;

    useEffect(() => {
        setPage(1);
    }, [filteredEquipment]);

    // Statistics
    const stats = useMemo(() => {
        const totalAll = equipment.length;
        const totalWorking = equipment.filter((e) => e.state).length;
        const totalNotWorking = equipment.filter((e) => !e.state).length;

        // By type
        const byType = equipment.reduce((acc, e) => {
            const type = e.equipment_type || 'other';
            if (!acc[type]) acc[type] = { working: 0, notWorking: 0, total: 0 };
            if (e.state) acc[type].working++;
            else acc[type].notWorking++;
            acc[type].total++;
            return acc;
        }, {});

        return { totalAll, totalWorking, totalNotWorking, byType };
    }, [equipment]);

    // Chart data
    const statusData = Object.keys(stats.byType).map((type) => ({
        name: type,
        Working: stats.byType[type].working,
        'Not Working': stats.byType[type].notWorking,
        All: stats.byType[type].total,
    }));

    const distributionData = Object.keys(stats.byType)
        .filter((type) => stats.byType[type].total > 0)
        .map((type) => ({
            name: type,
            value: stats.byType[type].total,
            percentage: ((stats.byType[type].total / equipment.length) * 100).toFixed(0),
        }));

    const timelineData = [
        { period: 'Today', All: equipment.length, Working: stats.totalWorking, 'Not Working': stats.totalNotWorking },
        { period: 'This Week', All: equipment.length, Working: stats.totalWorking, 'Not Working': stats.totalNotWorking },
        { period: 'This Month', All: equipment.length, Working: stats.totalWorking, 'Not Working': stats.totalNotWorking },
    ];

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

    return (
        <AppLayout>
            <Head title="Equipment" />
            <div className="flex flex-col gap-6 px-4 py-6 sm:p-8 lg:gap-10 lg:p-10">
                <Banner illustration={illustration} />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Equipment</h1>
                        <p className="text-sm text-muted-foreground">{filteredEquipment.length} items</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-transparent hover:text-[var(--color-alpha)]"
                    >
                        Add equipment
                    </button>
                </div>

                {/* Filter section */}
                <div className="space-y-4">
                    {/* First row: Type filter */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 max-md:flex-col max-md:items-start">
                            <Label htmlFor="filter-type" className="text-sm font-medium">
                                Filter by type:
                            </Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-48 max-md:w-full">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {baseTypes
                                        .filter((t) => t !== 'other')
                                        .map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Search and State filter */}
                            <Select value={filterState} onValueChange={setFilterState}>
                                <SelectTrigger className="w-40 max-md:w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All States</SelectItem>
                                    <SelectItem value="working">Working</SelectItem>
                                    <SelectItem value="not_working">Not Working</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-xs max-md:w-full"
                                />
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openTypeManager}
                                className="cursor-pointer p-2 text-xs max-md:w-full"
                                title="Manage Equipment Types"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                        {filterType !== 'all' && (
                            <Button variant="outline" size="sm" onClick={() => setFilterType('all')} className="text-xs">
                                Clear filter
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Total Equipment</CardTitle>
                            <Package className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold dark:text-white">{stats.totalAll}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Working</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{stats.totalWorking}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Not Working</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-400">{stats.totalNotWorking}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="mb-8 space-y-6">
                    {/* Bar Chart */}
                    <Card className="p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <h2 className="text-xl font-semibold text-white">Status Distribution by Type</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    labelStyle={{ color: '#f9fafb' }}
                                />
                                <Legend />
                                <Bar dataKey="All" fill="#3b82f6" />
                                <Bar dataKey="Working" fill="#10b981" />
                                <Bar dataKey="Not Working" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Pie Chart */}
                        <Card className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-2xl">📈</span>
                                <h2 className="text-xl font-semibold text-white">Equipment Type Distribution</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Line Chart */}
                        <Card className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-2xl">📉</span>
                                <h2 className="text-xl font-semibold text-white">Equipment Timeline</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="period" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f9fafb' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="All" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Working" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Not Working" stroke="#ef4444" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                    <table className="min-w-full divide-y divide-sidebar-border/70">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Photo</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Reference</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Mark</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">State</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {pagedEquipment.map((e) => (
                                <tr key={e.id} className="hover:bg-accent/30">
                                    <td className="px-4 py-3">
                                        {e.image ? (
                                            <button onClick={() => setPreviewSrc(e.image)} className="group cursor-pointer rounded outline-hidden">
                                                <img
                                                    src={e.image}
                                                    alt={e.reference}
                                                    className="h-10 w-10 rounded object-cover transition group-hover:opacity-90"
                                                />
                                            </button>
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <button
                                            onClick={() => openHistory(e)}
                                            className="cursor-pointer text-left transition-colors hover:text-[var(--color-alpha)] hover:underline"
                                            title="Click to view history"
                                        >
                                            {e.reference}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{e.mark}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${e.state ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}
                                        >
                                            {e.state ? 'Working' : 'Not working'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button
                                                className="cursor-pointer p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-alpha)]"
                                                title="History"
                                                onClick={() => openHistory(e)}
                                            >
                                                <History size={18} className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="cursor-pointer p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-alpha)]"
                                                title="Edit"
                                                onClick={() => handleEdit(e)}
                                            >
                                                <Pencil size={18} className="text-alpha" />
                                            </button>
                                            <button
                                                className="cursor-pointer p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-red-600"
                                                title="Delete"
                                                onClick={() => handleDelete(e)}
                                            >
                                                <Trash size={18} className="text-error" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEquipment.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        {filterType === 'all' ? 'No equipment yet.' : `No ${filterType} equipment found.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!showAll && totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="cursor-pointer"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="cursor-pointer"
                            >
                                Next
                            </Button>
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)} className="cursor-pointer">
                            {showAll ? 'Show Paginated' : 'Show All'}
                        </Button>
                    </div>
                )}

                <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
                    <DialogContent className="max-w-3xl bg-light p-0 text-dark dark:bg-dark dark:text-light">
                        {previewSrc && <img src={previewSrc} alt="Equipment" className="max-h-[80vh] w-full object-contain" />}
                    </DialogContent>
                </Dialog>

                {/* Add equipment modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-lg bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Add an Equipment</h2>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mark">Equipment Mark</Label>
                                    <Input id="mark" placeholder="mark" value={data.mark} onChange={(e) => setData('mark', e.target.value)} />
                                    {errors.mark && <p className="text-xs text-destructive">{errors.mark}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reference">Equipment Reference</Label>
                                    <Input
                                        id="reference"
                                        placeholder="reference"
                                        value={data.reference}
                                        onChange={(e) => setData('reference', e.target.value)}
                                    />
                                    {errors.reference && <p className="text-xs text-destructive">{errors.reference}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Equipment Type</Label>
                                    <Select value={data.equipment_type} onValueChange={(v) => setData('equipment_type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Equipment Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {addModalTypes.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.equipment_type === 'other' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="other-type">Specify Equipment Type</Label>
                                        <Input
                                            id="other-type"
                                            placeholder="e.g. tripod"
                                            value={data.other_type}
                                            onChange={(e) => setData('other_type', e.target.value)}
                                        />
                                        {errors.other_type && <p className="text-xs text-destructive">{errors.other_type}</p>}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Upload Image</Label>
                                    <Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                    {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Equipment State</Label>
                                    <Select value={String(data.state)} onValueChange={(v) => setData('state', parseInt(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Working</SelectItem>
                                            <SelectItem value="0">Not working</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" className="cursor-pointer" onClick={() => setIsAddOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                    disabled={processing}
                                    onClick={handleAddEquipment}
                                >
                                    Add an Equipment
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit equipment modal */}
                <Dialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) {
                            resetEdit(); // Clear errors when closing modal
                            setEditingEquipment(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-lg bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Edit Equipment</h2>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-mark">Equipment Mark</Label>
                                    <Input
                                        id="edit-mark"
                                        placeholder="mark"
                                        value={editData.mark}
                                        onChange={(e) => setEditData('mark', e.target.value)}
                                    />
                                    {editErrors.mark && <p className="text-xs text-destructive">{editErrors.mark}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-reference">Equipment Reference</Label>
                                    <Input
                                        id="edit-reference"
                                        placeholder="reference"
                                        value={editData.reference}
                                        onChange={(e) => setEditData('reference', e.target.value)}
                                    />
                                    {editErrors.reference && <p className="text-xs text-destructive">{editErrors.reference}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Equipment Type</Label>
                                    <Select value={editData.equipment_type} onValueChange={(v) => setEditData('equipment_type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Equipment Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {baseTypes.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {editData.equipment_type === 'other' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-other-type">Specify Equipment Type</Label>
                                        <Input
                                            id="edit-other-type"
                                            placeholder="e.g. tripod"
                                            value={editData.other_type}
                                            onChange={(e) => setEditData('other_type', e.target.value)}
                                        />
                                        {editErrors.other_type && <p className="text-xs text-destructive">{editErrors.other_type}</p>}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-image">Upload New Image (optional)</Label>
                                    <Input
                                        id="edit-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditData('image', e.target.files?.[0] ?? null)}
                                    />
                                    {editErrors.image && <p className="text-xs text-destructive">{editErrors.image}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Equipment State</Label>
                                    <Select value={String(editData.state)} onValueChange={(v) => setEditData('state', parseInt(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Working</SelectItem>
                                            <SelectItem value="0">Not working</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editErrors.state && <p className="text-xs text-destructive">{editErrors.state}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        resetEdit();
                                        setIsEditOpen(false);
                                        setEditingEquipment(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                    disabled={editProcessing}
                                    onClick={handleUpdateEquipment}
                                >
                                    Update Equipment
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation modal */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="max-w-md bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Delete Equipment</h2>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                                </div>
                            </div>

                            {deletingEquipment && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-3">
                                        {deletingEquipment.image && (
                                            <img
                                                src={deletingEquipment.image}
                                                alt={deletingEquipment.reference}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{deletingEquipment.reference}</p>
                                            <p className="text-sm text-muted-foreground">{deletingEquipment.mark}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteOpen(false);
                                        setDeletingEquipment(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Equipment
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Type Management Modal */}
                <Dialog open={isTypeManagerOpen} onOpenChange={setIsTypeManagerOpen}>
                    <DialogContent className="max-w-2xl bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-medium">Manage Equipment Types</h2>
                            </div>

                            {/* Add new type section */}
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <h3 className="mb-3 text-sm font-medium">Add New Type</h3>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Enter type name (e.g., camera, microphone)"
                                            value={typeData.name}
                                            onChange={(e) => setTypeData('name', e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    if (editingType) {
                                                        handleUpdateType();
                                                    } else {
                                                        handleAddType();
                                                    }
                                                }
                                            }}
                                        />
                                        {typeErrors.name && <p className="mt-1 text-xs text-destructive">{typeErrors.name}</p>}
                                    </div>
                                    <Button
                                        onClick={editingType ? handleUpdateType : handleAddType}
                                        disabled={typeProcessing || !typeData.name.trim()}
                                        className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                    >
                                        {editingType ? 'Update' : 'Add'} Type
                                    </Button>
                                    {editingType && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditingType(null);
                                                resetType();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Types list */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Existing Types</h3>
                                {isLoadingTypes ? (
                                    <div className="py-4 text-center text-muted-foreground">Loading types...</div>
                                ) : equipmentTypes.length === 0 ? (
                                    <div className="py-4 text-center text-muted-foreground">No types found.</div>
                                ) : (
                                    <div className="max-h-60 space-y-2 overflow-y-auto">
                                        {equipmentTypes.map((type) => (
                                            <div key={type.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium">{type.name.charAt(0).toUpperCase() + type.name.slice(1)}</span>
                                                        <span className="rounded bg-muted px-2 py-1 text-xs">{type.equipment_count} equipment</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditType(type)}
                                                        className="p-2"
                                                        title="Edit type"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteType(type)}
                                                        className="p-2 hover:border-red-600 hover:text-red-600"
                                                        title="Delete type"
                                                    >
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-3 text-xs text-muted-foreground">
                                <p>
                                    <strong>Note:</strong> When you delete a type that's being used by equipment, those equipment items will be
                                    automatically reassigned to the "other" type.
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Type Delete Confirmation Modal */}
                <Dialog open={isTypeDeleteOpen} onOpenChange={setIsTypeDeleteOpen}>
                    <DialogContent className="max-w-md bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Delete Equipment Type</h2>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                                </div>
                            </div>

                            {deletingType && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div>
                                        <p className="font-medium">{deletingType.name.charAt(0).toUpperCase() + deletingType.name.slice(1)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {deletingType.equipment_count === 0
                                                ? 'No equipment using this type'
                                                : `${deletingType.equipment_count} equipment items using this type will be reassigned to "other"`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsTypeDeleteOpen(false);
                                        setDeletingType(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDeleteType}>
                                    Delete Type
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Enhanced History Modal */}
                <Dialog
                    open={isHistoryOpen}
                    onOpenChange={(open) => {
                        setIsHistoryOpen(open);
                        if (!open) {
                            setHistoryItems([]);
                            setHistoryEquipment(null);
                            setHistoryTab('usage');
                        }
                    }}
                >
                    <DialogContent className="max-w-4xl bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-medium">Equipment History</h2>
                                    {historyEquipment && (
                                        <p className="text-sm text-muted-foreground">
                                            {historyEquipment.reference} — {historyEquipment.mark}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsAddNoteOpen(true)} className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Add Note
                                    </Button>
                                </div>
                            </div>

                            {/* History Tabs */}
                            <div className="flex border-b border-sidebar-border/70">
                                <button
                                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        historyTab === 'usage'
                                            ? 'border-[var(--color-alpha)] text-[var(--color-alpha)]'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setHistoryTab('usage')}
                                >
                                    Usage History
                                </button>
                                <button
                                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        historyTab === 'notes'
                                            ? 'border-[var(--color-alpha)] text-[var(--color-alpha)]'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setHistoryTab('notes')}
                                >
                                    Notes
                                </button>
                            </div>

                            {/* History Content */}
                            <div className="overflow-hidden rounded-xl border border-sidebar-border/70">
                                <div className="flex items-center justify-between bg-secondary/50 px-4 py-3 text-sm font-medium">
                                    <span>
                                        {historyTab === 'usage' && 'Usage History'}
                                        {historyTab === 'notes' && 'Notes'}
                                    </span>
                                    {isLoadingHistory && <span className="text-xs text-muted-foreground">Loading…</span>}
                                </div>

                                {historyItems.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        {isLoadingHistory ? 'Fetching history…' : 'No history found.'}
                                    </div>
                                ) : (
                                    <div className="max-h-96 divide-y divide-sidebar-border/70 overflow-y-auto">
                                        {historyItems
                                            .filter((item) => {
                                                if (historyTab === 'usage') return item.type === 'usage';
                                                if (historyTab === 'notes') return item.type === 'note';
                                                return true;
                                            })
                                            .map((item, index) => {
                                                if (item.type === 'usage') {
                                                    return (
                                                        <div key={`usage-${item.id}-${index}`} className="flex items-start gap-4 px-4 py-3">
                                                            <div className="mt-1 flex-shrink-0">
                                                                <Activity className="h-4 w-4 text-green-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center rounded bg-green-500/15 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                                                                        {item.action?.replace('_', ' ').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="mb-1 text-sm font-medium">
                                                                    {item.description || `${item.action?.replace('_', ' ')} activity`}
                                                                </div>
                                                                <div className="mb-1 text-xs text-muted-foreground">Used by: {item.user_name}</div>
                                                                {(item.started_at || item.ended_at) && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {item.started_at && (
                                                                            <span className="mr-4">
                                                                                Started: {new Date(item.started_at).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                        {item.ended_at && (
                                                                            <span>Ended: {new Date(item.ended_at).toLocaleString()}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (item.type === 'note') {
                                                    return (
                                                        <div key={`note-${item.id}-${index}`} className="flex items-start gap-4 px-4 py-3">
                                                            <div className="mt-1 flex-shrink-0">
                                                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center rounded bg-blue-500/15 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300">
                                                                        {item.type?.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(item.created_at).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="mb-1 text-sm font-medium">{item.note}</div>
                                                                <div className="text-xs text-muted-foreground">Added by: {item.user_name}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Note Modal */}
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                    <DialogContent className="max-w-lg bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Add Note</h2>
                            {historyEquipment && (
                                <p className="text-sm text-muted-foreground">
                                    Adding note for {historyEquipment.reference} — {historyEquipment.mark}
                                </p>
                            )}
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="note-content">Note Content</Label>
                                    <Textarea
                                        id="note-content"
                                        placeholder="Enter your note here..."
                                        value={noteData.note}
                                        onChange={(e) => setNoteData('note', e.target.value)}
                                        rows={4}
                                    />
                                    {noteErrors.note && <p className="text-xs text-destructive">{noteErrors.note}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetNote();
                                        setIsAddNoteOpen(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                    disabled={noteProcessing || !noteData.note.trim()}
                                    onClick={handleAddNote}
                                >
                                    Add Note
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default EquipmentIndex;
