import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

const DeletePlaceModal = ({ 
    isOpen, 
    onClose, 
    deletingPlace, 
    onConfirm 
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Delete Place</h2>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {deletingPlace && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-center gap-3">
                                {deletingPlace.image && (
                                    <img
                                        src={deletingPlace.image}
                                        alt={deletingPlace.name}
                                        className="h-10 w-10 rounded object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">{deletingPlace.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {deletingPlace.place_type.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                        >
                            Delete Place
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeletePlaceModal;

