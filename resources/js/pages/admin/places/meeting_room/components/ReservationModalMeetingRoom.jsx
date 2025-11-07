import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReservationModalMeetingRoom = ({ isOpen, onClose, meetingRoom, selectedRange, onSuccess }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        meeting_room_id: meetingRoom?.id || '',
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

        const minMinutes = 8 * 60;
        const maxMinutes = 18 * 60;
        const startMinutes = data.start ? toMinutes(data.start) : null;
        const endMinutes = data.end ? toMinutes(data.end) : null;


        if (!data.start || !data.end) {
            setTimeError('Please select both start and end times.');
            return;
        }

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

        const formData = {
            meeting_room_id: data.meeting_room_id,
            day: data.day,
            start: data.start,
            end: data.end,
        };

        post('/admin/reservations/storeReservationMeetingRoom', {
            data: formData,
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Meeting room reservation error:', errors);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto max-md:w-[95vw]">
                <DialogHeader>
                    <DialogTitle>
                        Reservation {meetingRoom?.name || 'Meeting Room'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Meeting Room Image */}
                        {meetingRoom?.image && (
                            <img
                                src={meetingRoom.image}
                                alt={meetingRoom.name}
                                className="h-40 w-full rounded object-cover transition group-hover:opacity-90"
                            />
                        )}

                        {/* Date & Time Inputs */}
                        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                            {/* Date */}
                            <div>
                                <Label htmlFor="day">Date</Label>
                                <Input
                                    id="day"
                                    type="date"
                                    value={data.day}
                                    onChange={(e) => setData('day', e.target.value)}
                                    required
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <Label htmlFor="start">Start Time</Label>
                                <Input
                                    id="start"
                                    type="time"
                                    value={data.start}
                                    onChange={(e) => setData('start', e.target.value)}
                                    required
                                    min="08:00"
                                    max="18:00"
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                />
                                {errors.start && (
                                    <p className="text-red-500 text-sm mt-1">{errors.start}</p>
                                )}
                            </div>

                            {/* End Time */}
                            <div>
                                <Label htmlFor="end">End Time</Label>
                                <Input
                                    id="end"
                                    type="time"
                                    value={data.end}
                                    onChange={(e) => setData('end', e.target.value)}
                                    required
                                    min="08:00"
                                    max="18:00"
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                />
                                {errors.end && (
                                    <p className="text-red-500 text-sm mt-1">{errors.end}</p>
                                )}
                            </div>
                        </div>

                        {/* Time validation error */}
                        {timeError && (
                            <p className="text-red-500 text-sm mt-2">{timeError}</p>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={handleClose}
                                variant="outline"
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="cursor-pointer text-black hover:text-white dark:hover:text-black"
                                disabled={processing}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModalMeetingRoom;
