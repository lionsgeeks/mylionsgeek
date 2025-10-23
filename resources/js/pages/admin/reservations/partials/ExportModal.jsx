import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const ExportModal = ({ open, onClose, reservations }) => {
    const [exportFilters, setExportFilters] = useState({});

    // Reset checkboxes
    useEffect(() => {
        if (open) {
            setExportFilters({});
        }
    }, [open]);

    // Function to generate label men field name automatically
    const formatFieldLabel = (fieldName) => {
        return fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    // Function bash tjib all available fields auto men data
    const getAllAvailableFields = () => {
        if (!reservations || reservations.length === 0) return {};

        const sampleReservation = reservations[0];
        const fields = {};

        Object.keys(sampleReservation).forEach(key => {
            const value = sampleReservation[key];
            
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
        Object.keys(allFields).forEach(key => {
            newFilters[key] = true;
        });
        setExportFilters(newFilters);
    };

    const handleDeselectAll = () => {
        setExportFilters({});
    };

    const handleExport = () => {
        const selectedFields = Object.keys(exportFilters).filter(key => exportFilters[key]);
        
        if (selectedFields.length === 0) {
            alert('Please select at least one field to export');
            return;
        }

        const params = new URLSearchParams();
        params.append('export', 'true');
        params.append('fields', selectedFields.join(','));
        
        window.location.href = `/admin/reservations?${params.toString()}`;
        
        setExportFilters({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Filter Export</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4">
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-950 dark:text-gray-200">Select fields to export:</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {Object.entries(getAllAvailableFields()).map(([key, label]) => (
                                <div key={key} className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        checked={exportFilters[key] || false}
                                        onChange={(e) => setExportFilters(prev => ({
                                            ...prev,
                                            [key]: e.target.checked
                                        }))}
                                        className="w-4 h-4 rounded text-[var(--color-alpha)] focus:ring-2 focus:ring-[var(--color-alpha)] focus:ring-offset-0 checked:bg-[var(--color-alpha)] cursor-pointer transition-all duration-150 accent-[var(--color-alpha)]"
                                    />
                                    <label htmlFor={key} className="text-sm text-gray-950 dark:text-white cursor-pointer">
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleSelectAll}
                            className="text-sm cursor-pointer"
                        >
                            Select All
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleDeselectAll}
                            className="text-sm cursor-pointer"
                        >
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
                            className="flex items-center gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
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
