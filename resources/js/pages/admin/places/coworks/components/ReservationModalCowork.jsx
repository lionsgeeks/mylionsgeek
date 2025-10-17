import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReservationModalCowork = ({ isOpen, onClose, cowork, selectedRange, onSuccess }) => {
   

    const { data, setData, post, processing, errors, reset } = useForm({
    cowork_id: cowork?.id || '',
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
            ...data
        };

        post('/admin/reservations/storeReservationCowork', {
            
            
            data: formData,
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
        });
        console.log(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto max-md:w-[95vw]">
                <DialogHeader>
                    <DialogTitle>
                        Reservation Table {cowork.table}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    { (
                        <div className="space-y-4">
                           <img
  src={`/storage/img/cowork/${cowork.image}`}
  alt={cowork.name}
  className="h-40 w-full rounded object-cover transition group-hover:opacity-90"
/>


                            

                            <div className="grid grid-cols-3 gap-4">
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

                            <div className="flex justify-end">
                                <Button type="button" onClick={handleSubmit} className="cursor-pointer text-black hover:text-white dark:hover:text-black">
                                    save
                                </Button>
                            </div>
                        </div>
                    )}

                   
                  
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModalCowork;
