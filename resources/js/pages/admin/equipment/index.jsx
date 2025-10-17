import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pencil, Trash, Settings, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EquipmentIndex = ({ equipment = [], types = [] }) => {
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [deletingEquipment, setDeletingEquipment] = useState(null);
    const [filterType, setFilterType] = useState('all');
    // History modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyEquipment, setHistoryEquipment] = useState(null);
    const [historyItems, setHistoryItems] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
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
    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: resetEdit, errors: editErrors } = useForm({
        mark: '',
        reference: '',
        equipment_type: '',
        other_type: '',
        state: 1,
        image: null,
    });

    // Type management form
    const { data: typeData, setData: setTypeData, post: postType, put: putType, processing: typeProcessing, reset: resetType, errors: typeErrors } = useForm({
        name: '',
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
            const res = await fetch(`/admin/equipements/${equipment.id}/history`);
            if (!res.ok) throw new Error('Failed to load history');
            const json = await res.json();
            setHistoryItems(Array.isArray(json.history) ? json.history : []);
        } catch (err) {
            console.error(err);
            setHistoryItems([]);
        } finally {
            setIsLoadingHistory(false);
        }
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
            }
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
            }
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
            }
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
            }
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
            }
        });
    };

    const confirmDelete = () => {
        if (deletingEquipment) {
            router.delete(`/admin/equipements/${deletingEquipment.id}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeletingEquipment(null);
                }
            });
        }
    };

    // Ensure 'other' exists in the type list and build options
    const baseTypes = Array.from(new Set([...(types || []), 'other'])).sort();
    // For the Add modal, we want 'other' to always be last
    const addModalTypes = [...baseTypes.filter((t) => t !== 'other'), 'other'];

    // Filter equipment based on selected type
    const filteredEquipment = filterType === 'all' 
        ? equipment 
        : equipment.filter(e => e.equipment_type === filterType);

    return (
        <AppLayout>
            <Head title="Equipment" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Equipment</h1>
                        <p className="text-sm text-muted-foreground">{filteredEquipment.length} items</p>
                    </div>
                    <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black border border-[var(--color-alpha)] transition-colors hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer">
                        Add equipment
                    </button>
                </div>

                {/* Filter section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-type" className="text-sm font-medium">Filter by type:</Label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {baseTypes.filter((t) => t !== 'other').map((t) => (
                                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={openTypeManager}
                            className="text-xs p-2"
                            title="Manage Equipment Types"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                    {filterType !== 'all' && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setFilterType('all')}
                            className="text-xs"
                        >
                            Clear filter
                        </Button>
                    )}
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
                            {filteredEquipment.map((e) => (
                                <tr key={e.id} className="hover:bg-accent/30">
                                    <td className="px-4 py-3">
                                        {e.image ? (
                                            <button onClick={() => setPreviewSrc(e.image)} className="group rounded outline-hidden cursor-pointer">
                                                <img src={e.image} alt={e.reference} className="h-10 w-10 rounded object-cover transition group-hover:opacity-90" />
                                            </button>
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{e.reference}</td>
                                    <td className="px-4 py-3 text-sm">{e.mark}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${e.state ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
                                            {e.state ? 'Working' : 'Not working'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button
                                                className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                                                title="History"
                                                onClick={() => openHistory(e)}
                                            >
                                                <History size={18} className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                                                title="Edit"
                                                onClick={() => handleEdit(e)}
                                            >
                                                <Pencil size={18} className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-red-600 cursor-pointer"
                                                title="Delete"
                                                onClick={() => handleDelete(e)}
                                            >
                                                <Trash size={18} className="h-4 w-4" />
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

                <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
                    <DialogContent className="max-w-3xl p-0 bg-light text-dark dark:bg-dark dark:text-light">
                        {previewSrc && (
                            <img src={previewSrc} alt="Equipment" className="max-h-[80vh] w-full object-contain" />
                        )}
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
                                    <Input id="reference" placeholder="reference" value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
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
                                                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.equipment_type === 'other' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="other-type">Specify Equipment Type</Label>
                                        <Input id="other-type" placeholder="e.g. tripod" value={data.other_type} onChange={(e) => setData('other_type', e.target.value)} />
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
                                <Button variant="outline" className="cursor-pointer" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button
                                    className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
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
                <Dialog open={isEditOpen} onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) {
                        resetEdit(); // Clear errors when closing modal
                        setEditingEquipment(null);
                    }
                }}>
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
                                                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
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
                                <Button variant="outline" className="cursor-pointer" onClick={() => {
                                    resetEdit();
                                    setIsEditOpen(false);
                                    setEditingEquipment(null);
                                }}>Cancel</Button>
                                <Button
                                    className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
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
                                    <p className="text-sm text-muted-foreground">
                                        This action cannot be undone.
                                    </p>
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
                                <Button 
                                    variant="destructive"
                                    onClick={confirmDelete}
                                >
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
                                <h3 className="text-sm font-medium mb-3">Add New Type</h3>
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
                                        {typeErrors.name && <p className="text-xs text-destructive mt-1">{typeErrors.name}</p>}
                                    </div>
                                    <Button 
                                        onClick={editingType ? handleUpdateType : handleAddType}
                                        disabled={typeProcessing || !typeData.name.trim()}
                                        className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]"
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
                                    <div className="text-center py-4 text-muted-foreground">Loading types...</div>
                                ) : equipmentTypes.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground">No types found.</div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {equipmentTypes.map((type) => (
                                            <div key={type.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium">{type.name.charAt(0).toUpperCase() + type.name.slice(1)}</span>
                                                        <span className="text-xs bg-muted px-2 py-1 rounded">
                                                            {type.equipment_count} equipment
                                                        </span>
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
                                                        className="p-2 hover:text-red-600 hover:border-red-600"
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

                            <div className="text-xs text-muted-foreground border-t pt-3">
                                <p><strong>Note:</strong> When you delete a type that's being used by equipment, those equipment items will be automatically reassigned to the "other" type.</p>
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
                                    <p className="text-sm text-muted-foreground">
                                        This action cannot be undone.
                                    </p>
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
                                <Button 
                                    variant="destructive"
                                    onClick={confirmDeleteType}
                                >
                                    Delete Type
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Reservation History Modal */}
                <Dialog open={isHistoryOpen} onOpenChange={(open) => {
                    setIsHistoryOpen(open);
                    if (!open) {
                        setHistoryItems([]);
                        setHistoryEquipment(null);
                    }
                }}>
                    <DialogContent className="max-w-2xl bg-light text-dark dark:bg-dark dark:text-light">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-medium">Reservation History</h2>
                                    {historyEquipment && (
                                        <p className="text-sm text-muted-foreground">
                                            {historyEquipment.reference} — {historyEquipment.mark}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border/70 overflow-hidden">
                                <div className="bg-secondary/50 px-4 py-3 text-sm font-medium flex items-center justify-between">
                                    <span>Last reservations</span>
                                    {isLoadingHistory && <span className="text-muted-foreground text-xs">Loading…</span>}
                                </div>
                                {historyItems.length === 0 ? (
                                    <div className="p-6 text-sm text-muted-foreground text-center">
                                        {isLoadingHistory ? 'Fetching history…' : 'No reservation history found.'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-sidebar-border/70">
                                        {historyItems.map((h) => {
                                            const status = h.canceled ? 'Canceled' : (h.approved ? 'Approved' : 'Pending');
                                            const statusClasses = h.canceled
                                                ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                                                : (h.approved ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300');
                                            return (
                                                <div key={`${h.reservation_id}-${h.day}-${h.start}`} className="px-4 py-3 flex items-center gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${statusClasses}`}>{status}</span>
                                                            {h.day && (
                                                                <span className="text-sm font-medium">
                                                                    {h.day}
                                                                </span>
                                                            )}
                                                            {(h.start || h.end) && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    {h.start || '--'} — {h.end || '--'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {h.user_name && (
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                Reserved by {h.user_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default EquipmentIndex;


