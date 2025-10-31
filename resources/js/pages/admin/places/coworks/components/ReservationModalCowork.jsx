import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const ReservationModalCowork = ({ isOpen, onClose, cowork, selectedRange, onSuccess, coworks = [] }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        table: cowork?.id || '',
        seats: 1,
        day: selectedRange?.day || '',
        start: selectedRange?.start || '',
        end: selectedRange?.end || '',
    });

    useEffect(() => {
        if (selectedRange) {
            setData({
                ...data,
                day: selectedRange.day,
                start: selectedRange.start,
                end: selectedRange.end,
            });
        }
    }, [selectedRange]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post('/admin/reservations/storeReservationCowork', {
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Cowork Reservation Errors:', errors);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-black border border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {cowork ? `Cowork Reservation - Table ${cowork.table || cowork.id}` : 'Cowork Reservation'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Table selector */}
                    <div>
                        <Label htmlFor="table" className="text-white/80">Table</Label>
                        <Select
                            value={String(data.table || '')}
                            onValueChange={(val) => setData('table', val)}
                            disabled={!!cowork}
                        >
                            <SelectTrigger id="table" className="bg-black border-[var(--color-alpha)] text-white h-10">
                                <SelectValue placeholder="Select a table" />
                            </SelectTrigger>
                            <SelectContent className="text-black">
                                {(cowork ? [cowork] : coworks).map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.table || t.name || `Table ${t.id}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.table && (
                            <p className="text-red-500 text-sm mt-1">{errors.table}</p>
                        )}
                    </div>
                    {/* Number of Seats */}
                    <div>
                        <Label htmlFor="seats" className="text-white/80">
                            Number of Seats
                        </Label>
                        <Input
                            id="seats"
                            type="number"
                            min="1"
                            max="20"
                            value={data.seats}
                            onChange={(e) => setData('seats', parseInt(e.target.value) || 1)}
                            className="bg-black border-[var(--color-alpha)] text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                            required
                        />
                        {errors.seats && (
                            <p className="text-red-500 text-sm mt-1">{errors.seats}</p>
                        )}
                    </div>

                    {/* Date, Start Time, End Time Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* DATE INPUT */}
                        <div>
                            <Label htmlFor="day" className="text-white/80">Date</Label>
                            <Input
                                id="day"
                                type="date"
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value)}
                                className="bg-black border-[var(--color-alpha)] text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.day && (
                                <p className="text-red-500 text-sm mt-1">{errors.day}</p>
                            )}
                        </div>

                        {/* START TIME */}
                        <div>
                            <Label htmlFor="start" className="text-white/80">Start Time</Label>
                            <Input
                                id="start"
                                type="time"
                                value={data.start}
                                onChange={(e) => setData('start', e.target.value)}
                                className="bg-black border-[var(--color-alpha)] text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.start && (
                                <p className="text-red-500 text-sm mt-1">{errors.start}</p>
                            )}
                        </div>

                        {/* END TIME */}
                        <div>
                            <Label htmlFor="end" className="text-white/80">End Time</Label>
                            <Input
                                id="end"
                                type="time"
                                value={data.end}
                                onChange={(e) => setData('end', e.target.value)}
                                className="bg-black border-[var(--color-alpha)] text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.end && (
                                <p className="text-red-500 text-sm mt-1">{errors.end}</p>
                            )}
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.table}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/80 text-black font-semibold"
                        >
                            {processing ? 'Saving...' : 'save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModalCowork;
