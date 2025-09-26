import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EquipmentIndex = ({ equipment = [] }) => {
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        mark: '',
        reference: '',
        equipment_type: '',
        state: '',
        image: null,
    });
    return (
        <AppLayout>
            <Head title="Equipment" />
            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Equipment</h1>
                        <p className="text-sm text-muted-foreground">{equipment.length} items</p>
                    </div>
                    <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black border border-[var(--color-alpha)] transition-colors hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer">
                        Add equipment
                    </button>
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
                            {equipment.map((e) => (
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
                                                title="Edit"
                                            >
                                                <Pencil size={18} className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-red-600 cursor-pointer"
                                                title="Delete"
                                                onClick={() => { /* TODO: hook delete */ }}
                                            >
                                                <Trash size={18} className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {equipment.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        No equipment yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
                    <DialogContent className="max-w-3xl p-0">
                        {previewSrc && (
                            <img src={previewSrc} alt="Equipment" className="max-h-[80vh] w-full object-contain" />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Add equipment modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="max-w-lg">
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
                                            <SelectItem value="camera">Camera</SelectItem>
                                            <SelectItem value="son">Son</SelectItem>
                                            <SelectItem value="lumiere">Lumière</SelectItem>
                                            <SelectItem value="data/stockage">Data/Stockage</SelectItem>
                                            <SelectItem value="podcast">Podcast</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Upload Image</Label>
                                    <Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                    {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Equipment State</Label>
                                    <Select value={data.state === '' ? '' : String(data.state)} onValueChange={(v) => setData('state', v)}>
                                        <SelectTrigger className={data.state === '' ? 'text-muted-foreground' : ''}>
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
                                    onClick={() => {
                                        post('/admin/equipements', {
                                            forceFormData: true,
                                            onSuccess: () => { reset(); setIsAddOpen(false); },
                                        });
                                    }}
                                >
                                    Add an Equipment
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


