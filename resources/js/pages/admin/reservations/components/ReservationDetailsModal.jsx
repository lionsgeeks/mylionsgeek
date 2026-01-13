import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Check, X, User, Calendar, Clock, Building2, Table, Tag } from 'lucide-react';
import { router } from '@inertiajs/react';
import InfoModalContent from './InfoModalContent';

const ReservationDetailsModal = ({ reservation, loadingAction, setLoadingAction }) => {
    if (!reservation) return null;

    const getStatusBadge = () => {
        if (reservation.canceled) {
            return <Badge className="bg-red-500/90 text-white border-0">Canceled</Badge>;
        }
        if (reservation.approved) {
            return <Badge className="bg-green-500/90 text-white border-0">Approved</Badge>;
        }
        if (reservation.type === 'exterior' && reservation.studio_responsable_approved) {
            return <Badge className="bg-blue-500/90 text-white border-0">Pending (Studio Approved)</Badge>;
        }
        return <Badge className="bg-yellow-500/90 text-white border-0">Pending</Badge>;
    };

    const getTypeBadge = () => {
        const type = reservation.type || reservation.place_type || 'Unknown';
        return <Badge className="bg-[var(--color-alpha)] text-white border-0 capitalize">{type}</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <DialogHeader className="pb-4 border-b border-sidebar-border/40">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-foreground">Reservation Details</DialogTitle>
                    <div className="flex items-center gap-2.5">
                        {/* {getStatusBadge()} */}
                        {/* {getTypeBadge()} */}
                    </div>
                </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
                {((reservation.type || reservation.place_type) !== 'cowork') && (
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-10">
                        <TabsTrigger value="details" className="text-sm font-medium">Details</TabsTrigger>
                        <TabsTrigger value="info" className="text-sm font-medium">Equipment & Team</TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="details" className="space-y-5 mt-0">

                    {/* Reservation Information */}
                    <Card className="bg-card/90 dark:bg-neutral-800/90 border-sidebar-border/40 shadow-sm">

                        <CardContent className="px-5 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reservation.user_name && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                            <Tag className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            User
                                        </div>
                                        <div className="text-sm font-semibold text-foreground leading-relaxed">{reservation.user_name}</div>
                                    </div>
                                )}

                                {((reservation.type || reservation.place_type) === 'studio') && reservation.studio_name && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                            <Building2 className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            Studio
                                        </div>
                                        <div className="text-sm font-semibold text-foreground leading-relaxed">{reservation.studio_name}</div>
                                    </div>
                                )}

                                {reservation.table && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                            <Table className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            Table
                                        </div>
                                        <div className="text-sm font-semibold text-foreground leading-relaxed">Table {reservation.table}</div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                        <Calendar className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                        Date
                                    </div>
                                    <div className="text-sm font-semibold text-foreground leading-relaxed">{reservation.date || reservation.day || '—'}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                        <Clock className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                        Time
                                    </div>
                                    <div className="text-sm font-semibold text-foreground leading-relaxed">{reservation.start} - {reservation.end}</div>
                                </div>

                                {reservation.type === 'exterior' && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                                            <User className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            Studio Responsable Approval
                                        </div>
                                        <div className="text-sm font-semibold text-foreground leading-relaxed">
                                            {reservation.studio_responsable_approved ? (
                                                <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sidebar-border/40">
                        {((reservation.type || reservation.place_type) !== 'cowork') && (
                            <Button
                                variant="outline"
                                className="flex cursor-pointer items-center gap-2 border-sidebar-border/50 hover:bg-muted hover:border-sidebar-border"
                                onClick={() => {
                                    router.visit(`/admin/reservations/${reservation.id}/details`);
                                }}
                            >
                                <FileText className="h-4 w-4" />
                                View Full Details
                            </Button>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                            {reservation.approved && reservation.type !== 'cowork' && (
                                <Button
                                    variant="outline"
                                    className="flex cursor-pointer items-center gap-2 bg-blue-500/90 text-white hover:bg-blue-600 border-blue-500/50 hover:border-blue-600"
                                    onClick={() => {
                                        window.open(`/admin/reservations/${reservation.id}/pdf`, '_blank');
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            )}
                            {!reservation.approved && !reservation.canceled && (
                                <Button
                                    className="flex cursor-pointer items-center gap-2 bg-green-500/90 text-white hover:bg-green-600"
                                    disabled={loadingAction.id === reservation.id}
                                    onClick={() => {
                                        setLoadingAction({ id: reservation.id, type: 'approve' });
                                        router.post(`/admin/reservations/${reservation.id}/approve`, {}, {
                                            onFinish: () => setLoadingAction({ id: null, type: null })
                                        });
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                    Approve
                                </Button>
                            )}
                            {!reservation.canceled && (
                                <Button
                                    variant="destructive"
                                    className="flex cursor-pointer items-center gap-2 bg-red-500/90 text-white hover:bg-red-600"
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
                                    <X className="h-4 w-4" />
                                    Cancel
                                
                                </Button>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {((reservation.type || reservation.place_type) !== 'cowork') && (
                    <TabsContent value="info" className="space-y-5 mt-0">
                        <Card className="bg-card/90 dark:bg-neutral-800/90 border-sidebar-border/40 shadow-sm">
                            <CardContent className="px-5 py-2">
                                <InfoModalContent reservationId={reservation.id} initial={reservation} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default ReservationDetailsModal;
