import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddPlaceModal = ({ isOpen, onClose, data, setData, errors, processing, types, onSubmit }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                                        <SelectItem key={t} value={t}>
                                            {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {data.place_type !== 'cowork' && (
                            <div className="grid gap-2">
                                <Label htmlFor="image">Upload Image</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                                />
                                {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                            </div>
                        )}
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
                        <Button variant="outline" className="cursor-pointer" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                            disabled={processing}
                            onClick={onSubmit}
                        >
                            Add Place
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddPlaceModal;
