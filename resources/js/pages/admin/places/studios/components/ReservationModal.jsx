import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import EquipmentSelector from './EquipmentSelector';
import TeamMemberSelector from './TeamMemberSelector';

const ReservationModal = ({ isOpen, onClose, studio, selectedRange, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        studio_id: studio.id,
        title: '',
        description: '',
        day: selectedRange?.day || '',
        start: selectedRange?.start || '',
        end: selectedRange?.end || '',
        team_members: [],
        equipment: [],
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
        setCurrentStep(1);
        setSelectedMembers([]);
        setSelectedEquipment([]);
        onClose();
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        setData(
            'team_members',
            selectedMembers.map((m) => m.id),
        );
    }, [selectedMembers]);

    useEffect(() => {
        setData(
            'equipment',
            selectedEquipment.map((e) => e.id),
        );
    }, [selectedEquipment]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            ...data,
            team_members: selectedMembers.map((m) => m.id),
            equipment: selectedEquipment.map((e) => e.id),
        };

        post('/admin/reservations/store', {
            data: formData,
            onSuccess: () => {
                handleClose();
                onSuccess();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto max-md:w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Reservation — Step {currentStep}/3</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Reservation Name</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801]"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter reservation name"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801]"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                                <div>
                                    <Label htmlFor="day">Date</Label>
                                    <Input
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801] dark:[color-scheme:dark]"
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
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801] dark:[color-scheme:dark]"
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
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801] dark:[color-scheme:dark]"
                                        id="end"
                                        type="time"
                                        value={data.end}
                                        onChange={(e) => setData('end', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="cursor-pointer text-black hover:text-white dark:hover:text-black"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team Members */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <TeamMemberSelector selected={selectedMembers} onSelect={setSelectedMembers} />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={handlePrevious} className="cursor-pointer dark:hover:bg-accent">
                                    ← Previous
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="cursor-pointer text-gray-900 hover:text-white dark:hover:text-gray-900"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Equipment */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <EquipmentSelector selected={selectedEquipment} onSelect={setSelectedEquipment} />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={handlePrevious} className="cursor-pointer dark:hover:bg-accent">
                                    ← Previous
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer text-gray-900 hover:text-white dark:hover:text-gray-900"
                                >
                                    {processing ? 'Creating...' : 'Create Reservation'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReservationModal;
