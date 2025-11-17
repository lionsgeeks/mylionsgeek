import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditPlaceModal = ({ 
    isOpen, 
    onClose, 
    editData, 
    setEditData, 
    editErrors, 
    editProcessing, 
    types, 
    editingPlace, 
    onSubmit 
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                                        <SelectItem key={t} value={t}>
                                            {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {editData.place_type !== 'cowork' && (
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
                        )}
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
                        <Button variant="outline" className="cursor-pointer" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                            disabled={editProcessing}
                            onClick={onSubmit}
                        >
                            Update Place
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPlaceModal;

