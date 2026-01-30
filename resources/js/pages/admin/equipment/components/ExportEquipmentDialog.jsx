import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useMemo, useState } from 'react';

export default function ExportEquipmentDialog({ open, setOpen, types = [] }) {
    const [exportFields, setExportFields] = useState({
        reference: true,
        mark: true,
        equipment_type: true,
        state: true,
        id: false,
        created_at: false,
        updated_at: false,
    });

    const [filterType, setFilterType] = useState('all');
    const [filterState, setFilterState] = useState('all');

    const exportQuery = useMemo(() => {
        const selected = Object.entries(exportFields)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(',');

        return selected.length ? selected : 'reference,mark,equipment_type,state';
    }, [exportFields]);

    const buildExportUrl = (includeFilters = true) => {
        const params = new URLSearchParams();
        params.append('fields', exportQuery);

        if (includeFilters) {
            if (filterType !== 'all') {
                params.append('type', filterType);
            }
            if (filterState !== 'all') {
                params.append('state', filterState);
            }
        }

        return `/admin/equipements/export?${params.toString()}`;
    };

    const triggerExportAll = () => {
        window.open(buildExportUrl(false), '_blank');
    };

    // Reset filters when dialog opens
    React.useEffect(() => {
        if (open) {
            setFilterType('all');
            setFilterState('all');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Export Equipment</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Filters Section */}
                    <div className="space-y-4 pb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="filter-type">Equipment Type</Label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger id="filter-type">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filter-state">State</Label>
                                <Select value={filterState} onValueChange={setFilterState}>
                                    <SelectTrigger id="filter-state">
                                        <SelectValue placeholder="All States" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        <SelectItem value="working">Working</SelectItem>
                                        <SelectItem value="not_working">Not Working</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button
                        onClick={triggerExportAll}
                        className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                    >
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
