import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useMemo, useState } from 'react';

export default function ExportComputersDialog({ open, setOpen, computers = [] }) {
    const [exportFields, setExportFields] = useState({
        reference: true,
        mark: true,
        cpu: true,
        gpu: true,
        state: true,
        user_name: true,
        id: false,
        user_id: false,
        created_at: false,
        updated_at: false,
    });

    const [filterState, setFilterState] = useState('all');
    const [filterCpu, setFilterCpu] = useState('all');
    const [filterGpu, setFilterGpu] = useState('all');

    // Get unique CPU values from computers
    const uniqueCpus = useMemo(() => {
        const cpus = computers
            .map((c) => c.cpu)
            .filter((cpu) => cpu && typeof cpu === 'string' && cpu.trim() !== '')
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();
        return cpus;
    }, [computers]);

    const exportQuery = useMemo(() => {
        const selected = Object.entries(exportFields)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(',');

        return selected.length ? selected : 'reference,mark,cpu,gpu,state,user_name';
    }, [exportFields]);

    const buildExportUrl = (includeFilters = true) => {
        const params = new URLSearchParams();
        params.append('fields', exportQuery);

        if (includeFilters) {
            if (filterState !== 'all') {
                params.append('state', filterState);
            }
            if (filterGpu !== 'all') {
                params.append('gpu', filterGpu);
            }
        }

        return `/admin/computers/export?${params.toString()}`;
    };

    const triggerExport = () => {
        window.open(buildExportUrl(true), '_blank');
    };

    useEffect(() => {
        if (open) {
            setFilterState('all');
            setFilterCpu('all');
            setFilterGpu('all');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Export Computers</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Filters Section */}
                    <div className="space-y-4 pb-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filter-gpu">CPU-GPU</Label>
                                <Select value={filterGpu} onValueChange={setFilterGpu}>
                                    <SelectTrigger id="filter-gpu">
                                        <SelectValue placeholder="All GPU" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All GPU</SelectItem>
                                        <SelectItem value="I5-GTX">I5-GTX</SelectItem>
                                        <SelectItem value="I7-RTX">I7-RTX</SelectItem>
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
                        onClick={triggerExport}
                        className="cursor-pointer border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                    >
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
