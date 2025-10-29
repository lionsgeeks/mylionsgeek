import React, { useState, useEffect } from 'react';
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

    // Update form when selectedRange changes
    React.useEffect(() => {
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
        
        const formData = {
            meeting_room_id: data.meeting_room_id,
            day: data.day,
            start: data.start,
            end: data.end,
        };
        
        post('/admin/reservations/storeReservationMeetingRoom', {
            data: formData,  // ← ZID DATA HNA!
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Meeting room reservation error:', errors);
            }
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
                            <div>
                                <Label htmlFor="day">Date</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="day"
                                    type="date"
                                    value={data.day}
                                    onChange={(e) => setData('day', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="start">Start Time</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="start"
                                    type="time"
                                    value={data.start}
                                    onChange={(e) => setData('start', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="end">End Time</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="end"
                                    type="time"
                                    value={data.end}
                                    onChange={(e) => setData('end', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Cancel & Save Buttons */}
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
                                type="button" 
                                onClick={handleSubmit} 
                                className="cursor-pointer text-black hover:text-white dark:hover:text-black"
                                disabled={processing}
                            >
                                save
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModalMeetingRoom;
