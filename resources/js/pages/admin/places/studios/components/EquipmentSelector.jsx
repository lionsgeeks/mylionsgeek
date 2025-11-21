import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const EquipmentSelector = ({ selected, onSelect, equipmentOptions = [] }) => {
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
            (Array.isArray(equipmentOptions)
                ? equipmentOptions.map((item) => ({
                      ...item,
                      image: normalizeImage(item.image),
                  }))
                : []),
        [equipmentOptions]
    );

    const filteredEquipment = useMemo(() => {
        if (!searchQuery) {
            return equipmentList;
        }
        const query = searchQuery.toLowerCase();
        return equipmentList.filter(
            (item) =>
                (item.mark || '').toLowerCase().includes(query) ||
                (item.reference || '').toLowerCase().includes(query)
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
                    className="bg-[#FFC801] hover:bg-neutral-900 hover:text-white text-black dark:bg-[#FFC801] dark:hover:bg-gray-200 dark:text-black cursor-pointer"
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
                            <div
                                key={item.id}
                                className="flex items-center gap-2 p-2 border border-border rounded-lg bg-white/80 dark:bg-[#111]"
                            >
                                {image && (
                                    <img
                                        src={image}
                                        alt={item.mark}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-10 w-10 object-cover rounded"
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
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive cursor-pointer"
                                >
                                    ×
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No equipment selected
                </p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col bg-light dark:bg-dark text-foreground border border-border">
                    <DialogHeader>
                        <DialogTitle>Select Equipment</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <Input
                            placeholder="Search equipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-[#0f0f0f]"
                        />

                        {equipmentList.length === 0 ? (
                            <p className="text-sm text-center py-4">No equipment available</p>
                        ) : filteredEquipment.length > 0 ? (
                            <div className="space-y-2">
                                {filteredEquipment.map((item) => {
                                    const isSelected = selected.some((e) => e.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 border border-border rounded-lg bg-white/80 dark:bg-[#111] hover:bg-muted/60 cursor-pointer transition-colors"
                                            onClick={() => handleToggle(item)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.mark}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-12 w-12 object-cover rounded"
                                                    onError={(e) => e.currentTarget.remove()}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.mark}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.reference}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4">No equipment matches your search</p>
                        )}
                    </div>

                    {/* Fixed Button at Bottom */}
                    <div className="pt-4 border-t border-border">
                        <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-[#FFC801] hover:bg-neutral-900 text-black hover:text-white cursor-pointer dark:hover:bg-gray-200 dark:hover:text-black"
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
