import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

const EquipmentSelector = ({ selected, onSelect, equipmentOptions = [], loading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const normalizeImage = (image) => {
        if (!image) return null;
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
        if (image.startsWith('/')) return image;
        if (image.startsWith('storage/')) return `/${image}`;
        if (image.startsWith('public/')) return `/${image.replace(/^public\//, 'storage/')}`;
        if (image.startsWith('img/')) return `/storage/${image}`;
        return `/storage/${image.replace(/^\/?/, '')}`;
    };

    const equipmentList = useMemo(
        () =>
            Array.isArray(equipmentOptions)
                ? equipmentOptions.map((item) => ({
                      ...item,
                      image: normalizeImage(item.image),
                  }))
                : [],
        [equipmentOptions],
    );

    const filteredEquipment = useMemo(() => {
        if (!searchQuery) {
            return equipmentList;
        }
        const query = searchQuery.toLowerCase();
        return equipmentList.filter(
            (item) => (item.mark || '').toLowerCase().includes(query) || (item.reference || '').toLowerCase().includes(query),
        );
    }, [equipmentList, searchQuery]);

    const handleToggle = (item) => {
        const isSelected = selected.some((e) => e.id === item.id);
        if (isSelected) {
            onSelect(selected.filter((e) => e.id !== item.id));
        } else {
            onSelect([...selected, item]);
        }
    };

    const handleRemove = (equipmentId) => {
        onSelect(selected.filter((e) => e.id !== equipmentId));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Equipment ({selected.length})</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer bg-[#FFC801] text-black hover:bg-neutral-900 hover:text-white dark:bg-[#FFC801] dark:text-black dark:hover:bg-gray-200"
                >
                    Add Equipment
                </Button>
            </div>

            {/* Selected Equipment */}
            {selected.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {selected.map((item) => {
                        const image = normalizeImage(item.image);
                        return (
                            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-white/80 p-2 dark:bg-[#111]">
                                {image && (
                                    <img
                                        src={image}
                                        alt={item.mark}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-10 w-10 rounded object-cover"
                                        onError={(e) => e.currentTarget.remove()}
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.mark}</p>
                                    <p className="text-xs text-muted-foreground">{item.reference}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(item.id)}
                                    className="h-6 w-6 cursor-pointer p-0 text-destructive hover:text-destructive"
                                >
                                    ×
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No equipment selected</p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flex max-h-[80vh] max-w-md flex-col border border-border bg-light text-foreground dark:bg-dark">
                    <DialogHeader>
                        <DialogTitle>Select Equipment</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <Input
                            placeholder="Search equipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-[#0f0f0f]"
                        />

                        {loading ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">Checking availability…</p>
                        ) : equipmentList.length === 0 ? (
                            <p className="py-4 text-center text-sm">No equipment available</p>
                        ) : filteredEquipment.length > 0 ? (
                            <div className="space-y-2">
                                {filteredEquipment.map((item) => {
                                    const isSelected = selected.some((e) => e.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-white/80 p-3 transition-colors hover:bg-muted/60 dark:bg-[#111]"
                                            onClick={() => handleToggle(item)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.mark}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-12 w-12 rounded object-cover"
                                                    onError={(e) => e.currentTarget.remove()}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.mark}</p>
                                                <p className="text-xs text-muted-foreground">{item.reference}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm">No equipment matches your search</p>
                        )}
                    </div>

                    {/* Fixed Button at Bottom */}
                    <div className="border-t border-border pt-4">
                        <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full cursor-pointer bg-[#FFC801] text-black hover:bg-neutral-900 hover:text-white dark:hover:bg-gray-200 dark:hover:text-black"
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EquipmentSelector;
