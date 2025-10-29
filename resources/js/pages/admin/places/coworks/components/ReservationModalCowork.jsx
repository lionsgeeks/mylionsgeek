import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const ReservationModalCowork = ({ isOpen, onClose, cowork, selectedRange, onSuccess }) => {
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
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md border border-white/10 bg-black text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">Cowork Reservation - Table {cowork?.table || cowork?.id}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="border-[var(--color-alpha)] bg-black text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                            required
                        />
                        {errors.seats && <p className="mt-1 text-sm text-red-500">{errors.seats}</p>}
                    </div>

                    {/* Date, Start Time, End Time Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* DATE INPUT */}
                        <div>
                            <Label htmlFor="day" className="text-white/80">
                                Date
                            </Label>
                            <Input
                                id="day"
                                type="date"
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value)}
                                className="border-[var(--color-alpha)] bg-black text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.day && <p className="mt-1 text-sm text-red-500">{errors.day}</p>}
                        </div>

                        {/* START TIME */}
                        <div>
                            <Label htmlFor="start" className="text-white/80">
                                Start Time
                            </Label>
                            <Input
                                id="start"
                                type="time"
                                value={data.start}
                                onChange={(e) => setData('start', e.target.value)}
                                className="border-[var(--color-alpha)] bg-black text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.start && <p className="mt-1 text-sm text-red-500">{errors.start}</p>}
                        </div>

                        {/* END TIME */}
                        <div>
                            <Label htmlFor="end" className="text-white/80">
                                End Time
                            </Label>
                            <Input
                                id="end"
                                type="time"
                                value={data.end}
                                onChange={(e) => setData('end', e.target.value)}
                                className="border-[var(--color-alpha)] bg-black text-white focus:border-[var(--color-alpha)] focus:ring-[var(--color-alpha)]"
                                required
                            />
                            {errors.end && <p className="mt-1 text-sm text-red-500">{errors.end}</p>}
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[var(--color-alpha)] font-semibold text-black hover:bg-[var(--color-alpha)]/80"
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
