import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import TeamMemberSelector from '../../places/studios/components/TeamMemberSelector';
import EquipmentSelector from '../../places/studios/components/EquipmentSelector';

const EditReservationModal = ({
    isOpen,
    onClose,
    data,
    setData,
    errors,
    processing,
    timeError,
    studios,
    selectedMembers,
    setSelectedMembers,
    selectedEquipment,
    setSelectedEquipment,
    onSubmit,
    equipmentOptions = [],
    teamMemberOptions = []
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto max-md:w-[95vw] bg-light dark:bg-dark">
                <DialogHeader>
                    <DialogTitle>Edit Reservation</DialogTitle>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Reservation Name</Label>
                            <Input
                                className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                                id="edit-title"
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
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] bg-light dark:bg-dark"
                                id="edit-description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter description (optional)"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-studio">Studio</Label>
                            <select
                                id="edit-studio"
                                className="mt-1 block w-full rounded-md border border-[#FFC801] bg-light dark:bg-dark px-3 py-2 focus:border-[#FFC801] focus:ring-[#FFC801] focus:ring-[1.5px]"
                                value={data.studio_id}
                                onChange={(e) => setData('studio_id', parseInt(e.target.value))}
                                required
                            >
                                <option value="">Select a studio</option>
                                {studios.map((studio) => (
                                    <option key={studio.id} value={studio.id}>
                                        {studio.name}
                                    </option>
                                ))}
                            </select>
                            {errors.studio_id && (
                                <p className="text-sm text-destructive mt-1">{errors.studio_id}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                            <div>
                                <Label htmlFor="edit-day">Date</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="edit-day"
                                    type="date"
                                    value={data.day}
                                    onChange={(e) => setData('day', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-start">Start Time</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="edit-start"
                                    type="time"
                                    value={data.start}
                                    onChange={(e) => setData('start', e.target.value)}
                                    required
                                    min="08:00"
                                    max="18:00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-end">End Time</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                    id="edit-end"
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

                        <div>
                            <TeamMemberSelector
                                selected={selectedMembers}
                                onSelect={setSelectedMembers}
                                teamMemberOptions={teamMemberOptions}
                            />
                        </div>

                        <div>
                           
                            <EquipmentSelector
                                selected={selectedEquipment}
                                onSelect={setSelectedEquipment}
                                equipmentOptions={equipmentOptions}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="cursor-pointer dark:hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer text-black hover:text-white dark:hover:text-black bg-[#FFC801] hover:bg-[#E5B700]"
                            >
                                {processing ? 'Updating...' : 'Update Reservation'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditReservationModal;

