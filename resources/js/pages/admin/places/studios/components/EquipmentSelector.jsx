import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

const EquipmentSelector = ({ selected, onSelect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [equipment, setEquipment] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isModalOpen && equipment.length === 0) {
            loadEquipment();
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredEquipment(
                equipment.filter(
                    (e) => e.mark.toLowerCase().includes(searchQuery.toLowerCase()) || e.reference.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            );
        } else {
            setFilteredEquipment(equipment);
        }
    }, [searchQuery, equipment]);

    const loadEquipment = () => {
        setLoading(true);
        fetch('/admin/api/equipment', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((data) => {
                setEquipment(Array.isArray(data) ? data : []);
                setFilteredEquipment(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setEquipment([]);
                setFilteredEquipment([]);
            })
            .finally(() => setLoading(false));
    };

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
                    {selected.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 rounded-lg border p-2">
                            {item.image && <img src={item.image} alt={item.mark} className="h-10 w-10 rounded object-cover" />}
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
                    ))}
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No equipment selected</p>
            )}

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Equipment</DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Area */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <Input
                            // className="block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                            placeholder="Search equipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {loading ? (
                            <p className="py-4 text-center text-sm">Loading...</p>
                        ) : filteredEquipment.length > 0 ? (
                            <div className="space-y-2">
                                {filteredEquipment.map((item) => {
                                    const isSelected = selected.some((e) => e.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-2 hover:bg-accent"
                                            onClick={() => handleToggle(item)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            {item.image && <img src={item.image} alt={item.mark} className="h-12 w-12 rounded object-cover" />}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.mark}</p>
                                                <p className="text-xs text-muted-foreground">{item.reference}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm">No equipment available</p>
                        )}
                    </div>

                    {/* Fixed Button at Bottom */}
                    <div className="border-t pt-4">
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
