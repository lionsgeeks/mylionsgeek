import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EventDetailsModal = ({ isOpen, onClose, event }) => {
    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <div className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Reservation details</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Title</div>
                            <div className="font-medium break-words">{event.title || '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Type</div>
                            <div className="font-medium capitalize">{String(event.type || '').replace('_', ' ') || '—'}</div>
                        </div>
                        {event.type === 'studio' && (
                            <div>
                                <div className="text-muted-foreground">Studio</div>
                                <div className="font-medium">{event.studio_name || '—'}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-muted-foreground">Date</div>
                            <div className="font-medium">{event.date || '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Time</div>
                            <div className="font-medium">{event.start || '—'}{event.end ? ` - ${event.end}` : ''}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">User</div>
                            <div className="font-medium">{event.user_name || '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Status</div>
                            <div className="font-medium">
                                {event.canceled ? 'Canceled' : event.approved ? 'Approved' : 'Pending'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-muted-foreground">Description</div>
                            <div className="font-medium whitespace-pre-wrap break-words">{event.description || '—'}</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EventDetailsModal;

