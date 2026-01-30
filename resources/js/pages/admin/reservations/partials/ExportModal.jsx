import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

const ExportModal = ({ open, onClose, reservations, fromDate, toDate, searchTerm, filterType, filterStatus }) => {
    const [exportFilters, setExportFilters] = useState({});

    // Reset checkboxes
    useEffect(() => {
        if (open) {
            setExportFilters({});
        }
    }, [open]);

    // Function to generate label men field name automatically
    const formatFieldLabel = (fieldName) => {
        return fieldName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Function bash tjib all available fields auto men data
    const getAllAvailableFields = () => {
        if (!reservations || reservations.length === 0) return {};

        const sampleReservation = reservations[0];
        const fields = {};

        // Fields to exclude from export
        const excludedFields = [
            'created_at',
            'updated_at',
            'user_id',
            'place_type',
            'place_name',
            'table',
            'date',
            'id',
            'seats',
            'team_name',
            'studio_name',
            'start_signed',
            'end_signed',
        ];

        Object.keys(sampleReservation).forEach((key) => {
            const value = sampleReservation[key];

            // Skip excluded fields
            if (excludedFields.includes(key.toLowerCase())) {
                return;
            }

            if (value !== null && typeof value === 'object') {
                return;
            }

            fields[key] = formatFieldLabel(key);
        });

        return fields;
    };

    const handleSelectAll = () => {
        const allFields = getAllAvailableFields();
        const newFilters = {};
        Object.keys(allFields).forEach((key) => {
            newFilters[key] = true;
        });
        setExportFilters(newFilters);
    };

    const handleDeselectAll = () => {
        setExportFilters({});
    };

    const handleExport = () => {
        const selectedFields = Object.keys(exportFilters).filter((key) => exportFilters[key]);

        if (selectedFields.length === 0) {
            //alert('Please select at least one field to export');
            return;
        }

        const params = new URLSearchParams();
        params.append('export', 'true');
        params.append('fields', selectedFields.join(','));

        // Add date filters if they exist
        if (fromDate) {
            params.append('from_date', fromDate);
        }
        if (toDate) {
            params.append('to_date', toDate);
        }

        // Add search filter
        if (searchTerm) {
            params.append('search', searchTerm);
        }

        // Add type filter
        if (filterType) {
            params.append('type', filterType);
        }

        // Add status filter
        if (filterStatus) {
            params.append('status', filterStatus);
        }

        window.location.href = `/admin/reservations?${params.toString()}`;

        setExportFilters({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-light dark:bg-dark">
                <DialogHeader>
                    <DialogTitle>Filter Export</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-950 dark:text-gray-200">Select fields to export:</h4>
                        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
                            {Object.entries(getAllAvailableFields()).map(([key, label]) => (
                                <div key={key} className="group flex cursor-pointer items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        checked={exportFilters[key] || false}
                                        onChange={(e) =>
                                            setExportFilters((prev) => ({
                                                ...prev,
                                                [key]: e.target.checked,
                                            }))
                                        }
                                        className="h-4 w-4 cursor-pointer rounded text-[var(--color-alpha)] accent-[var(--color-alpha)] transition-all duration-150 checked:bg-[var(--color-alpha)] focus:ring-2 focus:ring-[var(--color-alpha)] focus:ring-offset-0"
                                    />
                                    <label htmlFor={key} className="cursor-pointer text-sm text-gray-950 dark:text-white">
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSelectAll} className="cursor-pointer text-sm">
                            Select All
                        </Button>
                        <Button variant="outline" onClick={handleDeselectAll} className="cursor-pointer text-sm">
                            Deselect All
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExportFilters({});
                                onClose();
                            }}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExport}
                            className="flex cursor-pointer items-center gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                        >
                            <Download className="mr-2" size={16} />
                            Export
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExportModal;
