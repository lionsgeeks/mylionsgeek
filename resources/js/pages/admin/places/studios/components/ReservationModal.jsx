import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import TeamMemberSelector from './TeamMemberSelector';
import EquipmentSelector from './EquipmentSelector';

const ReservationModal = ({ isOpen, onClose, studio, selectedRange, onSuccess, studios = [] }) => {
    // If studio is already provided, skip step 0. Otherwise, show studio selection if studios array is provided
    const shouldShowStudioSelection = studios.length > 0 && !studio?.id;
    const [currentStep, setCurrentStep] = useState(shouldShowStudioSelection ? 0 : 1);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [timeError, setTimeError] = useState('');
    const [selectedStudio, setSelectedStudio] = useState(studio);

    const { data, setData, post, processing, errors, reset } = useForm({
        studio_id: selectedStudio?.id || studio?.id || '',
        title: '',
        description: '',
        day: selectedRange?.day || '',
        start: selectedRange?.start || '',
        end: selectedRange?.end || '',
        team_members: [],
        equipment: [],
    });

    useEffect(() => {
        if (selectedStudio) {
            setData('studio_id', selectedStudio.id);
        }
    }, [selectedStudio]);

    // Update form when selectedRange changes
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
        setCurrentStep(shouldShowStudioSelection ? 0 : 1);
        setSelectedMembers([]);
        setSelectedEquipment([]);
        setSelectedStudio(studio);
        setTimeError('');
        onClose();
    };

    const handleNext = () => {
        const startTime = data.start ? parseFloat(data.start.replace(':', '.')) : null;
        const endTime = data.end ? parseFloat(data.end.replace(':', '.')) : null;

        if (!startTime || !endTime) {
            setTimeError('Please select both start and end times.');
            return;
        }

        if (startTime < 8.0 || endTime > 18.0) {
            setTimeError('Reservation time must be between 08:00 and 18:00.');
            return;
        }

        if (endTime <= startTime) {
            setTimeError('End time must be later than start time.');
            return;
        }

        setTimeError('');
        // Total steps: if studio selection shown (step 0), then steps 0,1,2,3. Otherwise steps 1,2,3
        const maxStep = shouldShowStudioSelection ? 3 : 3;
        if (currentStep < maxStep) {
            setCurrentStep(currentStep + 1);
        }
    };


    const handlePrevious = () => {
        if (currentStep > (shouldShowStudioSelection ? 0 : 1)) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        setData('team_members', selectedMembers.map(m => m.id));
    }, [selectedMembers]);

    useEffect(() => {
        setData('equipment', selectedEquipment.map(e => e.id));
    }, [selectedEquipment]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            ...data,
            team_members: selectedMembers.map(m => m.id),
            equipment: selectedEquipment.map(e => e.id),
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
            <DialogContent className="max-w-3xl max-h-[85vh] max-md:w-[95vw] bg-light dark:bg-dark border border-gray-300 dark:border-gray-600 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Reservation — Step {currentStep + 1}/{shouldShowStudioSelection ? 4 : 3}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4 overflow-y-auto max-h-[calc(85vh-100px)]">
                    {/* Step 0: Studio Selection */}
                    {currentStep === 0 && shouldShowStudioSelection && (
                        <div className="space-y-4">
                            <Label className="text-base font-semibold mb-4 block text-foreground">Select Studio</Label>
                            <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffc801 transparent' }}>
                                {studios.filter(s => s.state).map(s => {
                                    const isSelected = selectedStudio?.id === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setSelectedStudio(s)}
                                            className={`flex-shrink-0 w-[160px] rounded-lg border-2 p-3 transition-all hover:shadow-md bg-white dark:bg-gray-800 ${
                                                isSelected
                                                    ? 'border-[#FFC801] bg-[#FFC801]/20 dark:bg-[#FFC801]/10 shadow-md scale-105'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#FFC801]/50 dark:hover:border-[#FFC801]/50'
                                            }`}
                                        >
                                            {s.image ? (
                                                <img
                                                    src={s.image}
                                                    alt={s.name}
                                                    className="w-full h-24 object-cover rounded-md mb-2 border border-gray-200 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="w-full h-24 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-2">
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <div className="font-semibold text-foreground text-sm">{s.name}</div>
                                                {isSelected && (
                                                    <div className="text-xs text-[#FFC801] mt-1 font-medium">
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (selectedStudio) {
                                            setCurrentStep(1);
                                        }
                                    }}
                                    disabled={!selectedStudio}
                                    className="cursor-pointer text-black hover:text-white dark:hover:text-black bg-[#FFC801] hover:bg-[#E5B700] px-6"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Reservation Name</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter reservation name"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] bg-light dark:bg-dark"
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
                                        min="08:00"
                                        max="18:00"
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
                                        min="08:00"
                                        max="18:00"
                                    />
                                </div>
                            </div>

                            {timeError && (
                                <p className="text-sm text-red-500 font-medium">{timeError}</p>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="cursor-pointer text-black hover:text-white dark:hover:text-black bg-[#FFC801] hover:bg-[#E5B700]"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team Members */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <TeamMemberSelector
                                selected={selectedMembers}
                                onSelect={setSelectedMembers}
                            />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={handlePrevious} className="cursor-pointer dark:hover:bg-accent">
                                    ← Previous
                                </Button>
                                <Button type="button" onClick={handleNext} className="cursor-pointer text-gray-900 hover:text-white dark:hover:text-gray-900">
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Equipment */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <EquipmentSelector
                                selected={selectedEquipment}
                                onSelect={setSelectedEquipment}
                            />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={handlePrevious} className="cursor-pointer dark:hover:bg-accent">
                                    ← Previous
                                </Button>
                                <Button type="submit" disabled={processing} className="cursor-pointer text-gray-900 hover:text-white dark:hover:text-gray-900">
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
