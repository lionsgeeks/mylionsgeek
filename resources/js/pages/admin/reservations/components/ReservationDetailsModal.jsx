import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Check, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import InfoModalContent from './InfoModalContent';

const ReservationDetailsModal = ({ reservation, loadingAction, setLoadingAction }) => {
    if (!reservation) return null;

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle className="text-lg">Reservation Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
                {((reservation.type || reservation.place_type) !== 'cowork') && (
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="info">Equipment & Team</TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Title</div>
                            <div className="font-medium">{reservation.title ?? '—'}</div>
                        </div>
                        {((reservation.type || reservation.place_type) === 'studio') && (
                            <div>
                                <div className="text-muted-foreground">Studio Name</div>
                                <div className="font-medium">{reservation.studio_name || '—'}</div>
                            </div>
                        )}
                        {reservation.table && (
                            <div>
                                <div className="text-muted-foreground">Table</div>
                                <div className="font-medium">Table {reservation.table}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-muted-foreground">Date</div>
                            <div className="font-medium">{reservation.date}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Time</div>
                            <div className="font-medium">{reservation.start} - {reservation.end}</div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                        {((reservation.type || reservation.place_type) !== 'cowork') && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 cursor-pointer"
                                onClick={() => {
                                    router.visit(`/admin/reservations/${reservation.id}/details`);
                                }}
                            >
                                <FileText className="h-4 w-4 mr-1" /> View Full Details
                            </Button>
                        )}

                        <div className='flex gap-x-2'>
                            {reservation.approved && reservation.type !== 'cowork' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                                    onClick={() => {
                                        window.open(`/admin/reservations/${reservation.id}/pdf`, '_blank');
                                    }}
                                >
                                    <Download className="h-4 w-4 " />
                                </Button>
                            )}
                            {!reservation.approved && !reservation.canceled && (
                                <Button
                                    size="sm"
                                    className="h-8 px-3 cursor-pointer bg-green-500 text-white hover:bg-green-600"
                                    disabled={loadingAction.id === reservation.id}
                                    onClick={() => {
                                        setLoadingAction({ id: reservation.id, type: 'approve' });
                                        router.post(`/admin/reservations/${reservation.id}/approve`, {}, {
                                            onFinish: () => setLoadingAction({ id: null, type: null })
                                        });
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            {!reservation.canceled && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 px-3 cursor-pointer"
                                    disabled={loadingAction.id === reservation.id}
                                    onClick={() => {
                                        const confirmMsg = reservation.approved ?
                                            'Cancel this approved reservation?' :
                                            'Cancel this reservation?';
                                        if (!window.confirm(confirmMsg)) return;
                                        setLoadingAction({ id: reservation.id, type: 'cancel' });

                                        const cancelRoute = reservation.type === 'cowork'
                                            ? `/admin/reservations/cowork/${reservation.id}/cancel`
                                            : `/admin/reservations/${reservation.id}/cancel`;

                                        router.post(cancelRoute, {}, {
                                            onFinish: () => setLoadingAction({ id: null, type: null })
                                        });
                                    }}
                                >
                                    {
                                        reservation.type === "cowork" ? (
                                            <div className="flex items-center gap-1 justify-center">
                                                <span>Cancel</span>
                                                <X className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <X className="h-4 w-4" />
                                        )
                                    }
                                </Button>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {((reservation.type || reservation.place_type) !== 'cowork') && (
                    <TabsContent value="info" className="space-y-4">
                        <InfoModalContent reservationId={reservation.id} initial={reservation} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default ReservationDetailsModal;

