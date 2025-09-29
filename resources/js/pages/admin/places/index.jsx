import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PlaceIndex = ({ places = [], types = [] }) => {
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);
    const [deletingPlace, setDeletingPlace] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        place_type: '',
        state: '',
        image: null,
    });
    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: resetEdit, errors: editErrors } = useForm({
        name: '',
        place_type: '',
        state: '',
        image: null,
    });

    const handleEdit = (place) => {
        setEditingPlace(place);
        setEditData({
            name: place.name,
            place_type: place.place_type,
            state: place.state ? '1' : '0',
            image: null,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (place) => {
        setDeletingPlace(place);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPlace) {
            router.delete(`/admin/places/${deletingPlace.id}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeletingPlace(null);
                }
            });
        }
    };

    const filteredPlaces = filterType === 'all' 
        ? places 
        : places.filter(e => e.place_type === filterType);

    return (
        <AppLayout>
            <Head title="Places" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Places</h1>
                        <p className="text-sm text-muted-foreground">{filteredPlaces.length} places</p>
                    </div>
                    <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black border border-[var(--color-alpha)] transition-colors hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer">
                        Add place
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-type" className="text-sm font-medium">Filter by type:</Label>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {types.map((t) => (
                                    <SelectItem key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">State</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70">
                            {filteredPlaces.map((e) => (
                                <tr key={e.id} className="hover:bg-accent/30">
                                    <td className="px-4 py-3">
                                        {e.image ? (
                                            <button onClick={() => setPreviewSrc(e.image)} className="group rounded outline-hidden cursor-pointer">
                                                <img src={e.image} alt={e.name} className="h-10 w-10 rounded object-cover transition group-hover:opacity-90" />
                                            </button>
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{e.name}</td>
                                    <td className="px-4 py-3 text-sm">{e.place_type.replace('_',' ')}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${e.state ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
                                            {e.state ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-1.5">
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
                            {filteredPlaces.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        {filterType === 'all' ? 'No places yet.' : `No ${filterType.replace('_',' ')} found.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
                    <DialogContent className="max-w-3xl p-0">
                        {previewSrc && (
                            <img src={previewSrc} alt="Place" className="max-h-[80vh] w-full object-contain" />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Add place modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-lg">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Add a Place</h2>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Place Name</Label>
                                    <Input id="name" name="name" placeholder="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Place Type</Label>
                                    <Select value={data.place_type} onValueChange={(v) => setData('place_type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose place type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Upload Image</Label>
                                    <Input id="image" name="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                    {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>State</Label>
                                    <Select value={data.state === '' ? '' : String(data.state)} onValueChange={(v) => setData('state', v)}>
                                        <SelectTrigger className={data.state === '' ? 'text-muted-foreground' : ''}>
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Available</SelectItem>
                                            <SelectItem value="0">Unavailable</SelectItem>
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
                                    onClick={() => {
                                        post('/admin/places', {
                                            forceFormData: true,
                                            onSuccess: () => { reset(); setIsAddOpen(false); },
                                        });
                                    }}
                                >
                                    Add Place
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit place modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-lg">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Edit Place</h2>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Place Name</Label>
                                    <Input 
                                        id="edit-name" 
                                        name="name"
                                        placeholder="name" 
                                        value={editData.name} 
                                        onChange={(e) => setEditData('name', e.target.value)} 
                                    />
                                    {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Place Type</Label>
                                    <Select value={editData.place_type} onValueChange={(v) => setEditData('place_type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose place type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((t) => (
                                                <SelectItem key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-image">Upload New Image (optional)</Label>
                                    <Input 
                                        id="edit-image" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setEditData('image', e.target.files?.[0] ?? null)} 
                                        name="image"
                                    />
                                    {editErrors.image && <p className="text-xs text-destructive">{editErrors.image}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>State</Label>
                                    <Select value={editData.state === '' ? '' : String(editData.state)} onValueChange={(v) => setEditData('state', v)}>
                                        <SelectTrigger className={editData.state === '' ? 'text-muted-foreground' : ''}>
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Available</SelectItem>
                                            <SelectItem value="0">Unavailable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editErrors.state && <p className="text-xs text-destructive">{editErrors.state}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" className="cursor-pointer" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button
                                    className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                                    disabled={editProcessing}
                                    onClick={() => {
                                        router.post(`/admin/places/${editingPlace.id}`, {
                                            ...editData,
                                            _method: 'put',
                                        }, {
                                            forceFormData: true,
                                            onSuccess: () => { resetEdit(); setIsEditOpen(false); setEditingPlace(null); },
                                        });
                                    }}
                                >
                                    Update Place
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation modal */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="max-w-md">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Delete Place</h2>
                                    <p className="text-sm text-muted-foreground">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            
                            {deletingPlace && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-3">
                                        {deletingPlace.image && (
                                            <img 
                                                src={deletingPlace.image} 
                                                alt={deletingPlace.name}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{deletingPlace.name}</p>
                                            <p className="text-sm text-muted-foreground">{deletingPlace.place_type.replace('_',' ')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsDeleteOpen(false);
                                        setDeletingPlace(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={confirmDelete}
                                >
                                    Delete Place
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default PlaceIndex;


