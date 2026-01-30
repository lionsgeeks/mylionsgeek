import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EquipmentSelector from './EquipmentSelector';
import TeamMemberSelector from './TeamMemberSelector';

const ReservationModal = ({
    isOpen,
    onClose,
    studio,
    selectedRange,
    onSuccess,
    studios = [],
    equipmentOptions = [],
    teamMemberOptions = [],
    blockedStudioIds = [],
    onTimeChange,
}) => {
    // If studio is already provided, skip step 0. Otherwise, show studio selection if studios array is provided
    const availableStudios = useMemo(() => studios.filter((s) => s.state && !blockedStudioIds.includes(s.id)), [studios, blockedStudioIds]);
    const shouldShowStudioSelection = studios.length > 0 && !studio?.id;
    const [currentStep, setCurrentStep] = useState(shouldShowStudioSelection ? 0 : 1);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [timeError, setTimeError] = useState('');
    const [selectedStudio, setSelectedStudio] = useState(studio);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictDetails, setConflictDetails] = useState([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const csrfTokenRef = useRef(null);
    useEffect(() => {
        if (typeof document !== 'undefined') {
            csrfTokenRef.current = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        }
    }, []);
    const [availableEquipment, setAvailableEquipment] = useState(equipmentOptions);
    const [equipmentAvailabilityLoading, setEquipmentAvailabilityLoading] = useState(false);
    const scrollContainerRef = useRef(null);

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
        if (selectedStudio?.id) {
            setData('studio_id', selectedStudio.id);
        } else if (!studio?.id) {
            setData('studio_id', '');
        }
    }, [selectedStudio, studio, setData]);

    useEffect(() => {
        if (studio?.id) {
            return;
        }
        if (selectedStudio && blockedStudioIds.includes(selectedStudio.id)) {
            setSelectedStudio(null);
        }
    }, [blockedStudioIds, selectedStudio, studio]);

    useEffect(() => {
        setAvailableEquipment(equipmentOptions);
    }, [equipmentOptions]);

    const fetchAvailableEquipment = useCallback(async () => {
        if (!data.day || !data.start || !data.end) {
            setAvailableEquipment(equipmentOptions);
            return;
        }

        setEquipmentAvailabilityLoading(true);
        try {
            const response = await fetch('/reservations/available-equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-Token': csrfTokenRef.current || '',
                },
                body: JSON.stringify({
                    day: data.day,
                    start: data.start,
                    end: data.end,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch available equipment');
            }

            const payload = await response.json();
            const availableList = Array.isArray(payload.available) ? payload.available : [];
            setAvailableEquipment(availableList);

            if (availableList.length) {
                setSelectedEquipment((prev) => prev.filter((item) => availableList.some((available) => available.id === item.id)));
            } else {
                setSelectedEquipment([]);
            }
        } catch (error) {
            console.error('Failed to fetch available equipment', error);
            setAvailableEquipment(equipmentOptions);
        } finally {
            setEquipmentAvailabilityLoading(false);
        }
    }, [data.day, data.start, data.end, equipmentOptions]);

    useEffect(() => {
        fetchAvailableEquipment();
    }, [fetchAvailableEquipment]);

    // Update form when selectedRange changes
    useEffect(() => {
        if (selectedRange) {
            setData({
                ...data,
                day: selectedRange.day,
                start: selectedRange.start,
                end: selectedRange.end,
            });
            if (onTimeChange) {
                onTimeChange(selectedRange);
            }
        }
    }, [selectedRange, onTimeChange]);

    const handleClose = () => {
        reset();
        setCurrentStep(shouldShowStudioSelection ? 0 : 1);
        setSelectedMembers([]);
        setSelectedEquipment([]);
        setSelectedStudio(studio);
        setTimeError('');
        onClose();
    };

    const isDateTimeInPast = useCallback((dayValue, timeValue) => {
        if (!dayValue || !timeValue) return false;
        const composed = new Date(`${dayValue}T${timeValue}`);
        return composed < new Date();
    }, []);

    const checkStudioAvailability = useCallback(async () => {
        const activeStudioId = selectedStudio?.id || studio?.id || data.studio_id;
        if (!activeStudioId || !data.day || !data.start || !data.end) {
            return true;
        }

        setCheckingAvailability(true);
        try {
            const response = await fetch('/reservations/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-Token': csrfTokenRef.current || '',
                },
                body: JSON.stringify({
                    studio_id: activeStudioId,
                    day: data.day,
                    start: data.start,
                    end: data.end,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to check studio availability');
            }

            const payload = await response.json();
            if (payload.available) {
                return true;
            }

            setConflictDetails(payload.conflicts || []);
            setConflictModalOpen(true);
            setTimeError('The selected studio is already reserved at this time. Please choose another time slot.');
            return false;
        } catch (error) {
            console.error('Failed to check studio availability', error);
            return true;
        } finally {
            setCheckingAvailability(false);
        }
    }, [data.day, data.start, data.end, data.studio_id, selectedStudio, studio]);

    const handleNext = async () => {
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

        if (isDateTimeInPast(data.day, data.start)) {
            setTimeError('Reservation start time cannot be in the past.');
            return;
        }

        setTimeError('');
        if (currentStep === 1) {
            const available = await checkStudioAvailability();
            if (!available) {
                return;
            }
        }

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

    // Check if scrollable content exists and update scroll indicator
    useEffect(() => {
        if (currentStep === 0 && shouldShowStudioSelection) {
            const checkScroll = () => {
                const container = scrollContainerRef.current;
                if (container) {
                    const hasScroll = container.scrollHeight > container.clientHeight;
                    const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
                    setShowScrollIndicator(hasScroll && !isScrolledToBottom);
                }
            };

            // Wait for DOM to render
            const timeoutId = setTimeout(() => {
                checkScroll();
                const container = scrollContainerRef.current;
                if (container) {
                    container.addEventListener('scroll', checkScroll);
                    window.addEventListener('resize', checkScroll);
                }
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                const container = scrollContainerRef.current;
                if (container) {
                    container.removeEventListener('scroll', checkScroll);
                    window.removeEventListener('resize', checkScroll);
                }
            };
        } else {
            setShowScrollIndicator(false);
        }
    }, [currentStep, shouldShowStudioSelection, availableStudios]);

    const handleRangeFieldChange = (field, value) => {
        setData(field, value);
        if (onTimeChange) {
            const nextRange = {
                day: field === 'day' ? value : data.day,
                start: field === 'start' ? value : data.start,
                end: field === 'end' ? value : data.end,
            };
            onTimeChange(nextRange);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDateTimeInPast(data.day, data.start)) {
            setTimeError('Reservation start time cannot be in the past.');
            return;
        }

        const available = await checkStudioAvailability();
        if (!available) {
            return;
        }

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
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden border border-gray-300 bg-light p-0 shadow-2xl max-md:w-[95vw] dark:border-gray-600 dark:bg-dark">
                <DialogHeader className="border-b border-gray-200 px-6 pt-6 pb-4 dark:border-gray-700">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Reservation — Step {currentStep + 1}/{shouldShowStudioSelection ? 4 : 3}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
                    {/* Step 0: Studio Selection */}
                    {currentStep === 0 && shouldShowStudioSelection && (
                        <div className="relative flex flex-col space-y-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                            <Label className="mb-4 block flex-shrink-0 text-base font-semibold text-foreground">Select Studio</Label>
                            <div
                                ref={scrollContainerRef}
                                className="custom-scrollbar relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-4"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffc801 transparent' }}
                            >
                                {availableStudios.map((s) => {
                                    const isSelected = selectedStudio?.id === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setSelectedStudio(s)}
                                            className={`group w-full rounded-xl border-2 bg-card p-4 backdrop-blur-sm transition-all duration-200 dark:bg-neutral-800/50 ${
                                                isSelected
                                                    ? 'border-[#FFC801] bg-[#FFC801]/10 shadow-lg ring-2 shadow-[#FFC801]/20 ring-[#FFC801]/30 dark:bg-[#FFC801]/15'
                                                    : 'border-border hover:border-[#FFC801]/60 hover:bg-accent/50 hover:shadow-md dark:border-neutral-700 dark:hover:border-[#FFC801]/60 dark:hover:bg-neutral-800/80'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                    {s.image ? (
                                                        <img
                                                            src={s.image}
                                                            alt={s.name}
                                                            className={`h-20 w-20 rounded-lg border-2 object-cover transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-[#FFC801] shadow-md'
                                                                    : 'border-border group-hover:border-[#FFC801]/50 dark:border-neutral-700'
                                                            }`}
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`flex h-20 w-20 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-[#FFC801] bg-muted/50'
                                                                    : 'border-border bg-muted/30 group-hover:border-[#FFC801]/50 dark:border-neutral-700'
                                                            }`}
                                                        >
                                                            <span className="text-xs text-muted-foreground">No Image</span>
                                                        </div>
                                                    )}
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC801] shadow-md">
                                                            <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={3}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 text-left">
                                                    <div
                                                        className={`mb-1 text-lg font-semibold text-foreground transition-colors ${
                                                            isSelected ? 'text-[#FFC801]' : 'group-hover:text-[#FFC801]'
                                                        }`}
                                                    >
                                                        {s.name}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC801]/10 px-2 py-1 text-xs font-medium text-[#FFC801] dark:bg-[#FFC801]/20">
                                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {availableStudios.length === 0 && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-medium text-red-600">
                                        All studios are busy for this time slot. Please pick another time.
                                    </div>
                                )}
                            </div>
                            {showScrollIndicator && (
                                <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 transform">
                                    <div className="flex animate-bounce flex-col items-center gap-1">
                                        <ChevronDown className="h-5 w-5 text-[#FFC801] drop-shadow-lg" />
                                        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#FFC801]/80 to-transparent"></div>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-shrink-0 justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (selectedStudio) {
                                            setCurrentStep(1);
                                        }
                                    }}
                                    disabled={!selectedStudio}
                                    className="cursor-pointer bg-[#FFC801] px-6 text-black hover:bg-[#E5B700] hover:text-white dark:hover:text-black"
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
                                    className="mt-1 block w-full border-[#FFC801] bg-light focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801] dark:bg-dark"
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
                                        onChange={(e) => handleRangeFieldChange('day', e.target.value)}
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
                                        onChange={(e) => handleRangeFieldChange('start', e.target.value)}
                                        required
                                        min="08:00"
                                        max="18:00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end">End Time</Label>
                                    <Input
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[1.5px] focus-visible:ring-[#FFC801] dark:[color-scheme:dark]"
                                        id="end"
                                        type="time"
                                        value={data.end}
                                        onChange={(e) => handleRangeFieldChange('end', e.target.value)}
                                        required
                                        min="08:00"
                                        max="18:00"
                                    />
                                </div>
                            </div>

                            {timeError && <p className="text-sm font-medium text-red-500">{timeError}</p>}

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={checkingAvailability}
                                    className="cursor-pointer bg-[#FFC801] text-black hover:bg-[#E5B700] hover:text-white dark:hover:text-black"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team Members */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <TeamMemberSelector selected={selectedMembers} onSelect={setSelectedMembers} teamMemberOptions={teamMemberOptions} />

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
                            <EquipmentSelector
                                selected={selectedEquipment}
                                onSelect={setSelectedEquipment}
                                equipmentOptions={availableEquipment}
                                loading={equipmentAvailabilityLoading}
                            />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={handlePrevious} className="cursor-pointer dark:hover:bg-accent">
                                    ← Previous
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || checkingAvailability}
                                    className="cursor-pointer text-gray-900 hover:text-white dark:hover:text-gray-900"
                                >
                                    {processing ? 'Creating...' : 'Create Reservation'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
            <AlertDialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
                <AlertDialogContent className="bg-light dark:bg-dark">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Studio already reserved</AlertDialogTitle>
                        <AlertDialogDescription>
                            The selected studio is already reserved for the chosen time. Please select another time slot.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {conflictDetails.length > 0 && (
                        <div className="space-y-2 rounded-lg border border-border bg-white/80 px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/60">
                            {conflictDetails.map((conflict) => (
                                <div key={conflict.id} className="flex flex-col">
                                    <span className="font-semibold text-foreground">{conflict.title || 'Existing reservation'}</span>
                                    <span className="text-muted-foreground">
                                        {conflict.start?.slice(0, 5)} - {conflict.end?.slice(0, 5)}{' '}
                                        {conflict.user_name ? `• ${conflict.user_name}` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setConflictModalOpen(false)}>Understood</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

export default ReservationModal;
