import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const ReservationModalCowork = ({ isOpen, onClose, cowork, selectedRange, onSuccess, coworks = [], allowMultiple = false, excludedTableId = null }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        table: cowork?.id || '',
        seats: 1,
        day: selectedRange?.day || '',
        start: selectedRange?.start || '',
        end: selectedRange?.end || '',
    });

    const [timeError, setTimeError] = useState('');

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

    useEffect(() => {
        if (cowork && cowork.id) {
            setData('table', cowork.id);
        }
    }, [cowork?.id]);

    const handleClose = () => {
        reset();
        setTimeError('');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const startMinutes = data.start ? toMinutes(data.start) : null;
        const endMinutes = data.end ? toMinutes(data.end) : null;

        const minMinutes = 8 * 60;
        const maxMinutes = 18 * 60;

        if (!data.start || !data.end) {
            setTimeError('Please select both start and end times.');
            return;
        }

        // Validate time range
        if (startMinutes < minMinutes || startMinutes > maxMinutes) {
            setTimeError('Start time must be between 08:00 and 18:00.');
            return;
        }

        if (endMinutes < minMinutes || endMinutes > maxMinutes) {
            setTimeError('End time must be between 08:00 and 18:00.');
            return;
        }

        if (endMinutes <= startMinutes) {
            setTimeError('End time must be later than start time.');
            return;
        }

        setTimeError('');

        post('/admin/reservations/storeReservationCowork', {
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Cowork Reservation Errors:', errors);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-light dark:bg-dark text-black dark:text-white border border-white/10   max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-black dark:text-white ">
                        {(() => {
                            const current = coworks.find(t => String(t.id) === String(data.table)) || cowork;
                            return current
                                ? `Cowork Reservation - ${current.table ? `Table ${current.table}` : (current.name || `Table ${current.id}`)}`
                                : 'Cowork Reservation';
                        })()}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Table Selection */}
                    <div>
                        <Label htmlFor="table" className="text-black dark:text-white">Table</Label>
                        <Select
                            value={String(data.table)}
                            onValueChange={(v) => setData('table', parseInt(v))}
                        >
                            <SelectTrigger className=" border-[var(--color-alpha)] bg-light dark:bg-dark text-black dark:text-white ">
                                <SelectValue placeholder="Select a table" />
                            </SelectTrigger>
                            <SelectContent>
                                {coworks.filter(c => c.state && c.id !== excludedTableId).map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.table ? `Table ${c.table}` : `Table ${c.id}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.table && <p className="text-red-500 text-sm mt-1">{errors.table}</p>}
                        {coworks.filter(c => c.state && c.id !== excludedTableId).length === 0 && (
                            <p className="text-red-500 text-sm mt-1">No available tables for this time slot</p>
                        )}
                    </div>

                    {/* Number of Seats */}
                    <div>
                        <Label htmlFor="seats" className="text-black dark:text-white ">Number of Seats</Label>
                        <Input
                            id="seats"
                            type="number"
                            min="1"
                            max="20"
                            value={data.seats}
                            onChange={(e) => setData('seats', parseInt(e.target.value) || 1)}
                            className="text-black dark:text-white bg-light dark:bg-dark border-[var(--color-alpha)]  focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                            required
                        />
                        {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
                    </div>

                    {/* Date, Start Time, End Time Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* DATE INPUT */}
                        <div>
                            <Label htmlFor="day" className="text-black dark:text-white ">Date</Label>
                            <Input
                                id="day"
                                type="date"
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value)}
                                className="bg-light dark:bg-dark text-black dark:text-white  border-[var(--color-alpha)]  focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.day && <p className="text-red-500 text-sm mt-1">{errors.day}</p>}
                        </div>

                        {/* START TIME */}
                        <div>
                            <Label htmlFor="start" className="text-black dark:text-white ">Start Time</Label>
                            <Input
                                id="start"
                                type="time"
                                value={data.start}
                                onChange={(e) => setData('start', e.target.value)}
                                className="bg-light dark:bg-dark border-[var(--color-alpha)] text-black dark:text-white  focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                                min="08:00"
                                max="18:00"
                            />
                            {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
                        </div>

                        {/* END TIME */}
                        <div>
                            <Label htmlFor="end" className="text-black dark:text-white ">End Time</Label>
                            <Input
                                id="end"
                                type="time"
                                value={data.end}
                                onChange={(e) => setData('end', e.target.value)}
                                className="bg-light dark:bg-dark border-[var(--color-alpha)] text-black dark:text-white  focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                                min="08:00"
                                max="18:00"
                            />
                            {errors.end && <p className="text-red-500 text-sm mt-1">{errors.end}</p>}
                        </div>
                    </div>

                    {/* Time Validation Message */}
                    {timeError && <p className="text-red-500 text-sm">{timeError}</p>}

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            className="bg-white/5 border-white/10 text-black dark:text-white  hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.table}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/80 text-black dark:text-white  font-semibold"
                        >
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModalCowork;
