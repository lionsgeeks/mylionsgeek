import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { Building2, Calendar, Check, Clock, Download, FileText, Table, Tag, X } from 'lucide-react';
import InfoModalContent from './InfoModalContent';

const ReservationDetailsModal = ({ reservation, loadingAction, setLoadingAction }) => {
    if (!reservation) return null;

    const getStatusBadge = () => {
        if (reservation.canceled) {
            return <Badge className="border-0 bg-red-500/90 text-white">Canceled</Badge>;
        }
        if (reservation.approved) {
            return <Badge className="border-0 bg-green-500/90 text-white">Approved</Badge>;
        }
        return <Badge className="border-0 bg-yellow-500/90 text-white">Pending</Badge>;
    };

    const getTypeBadge = () => {
        const type = reservation.type || reservation.place_type || 'Unknown';
        return <Badge className="border-0 bg-[var(--color-alpha)] text-white capitalize">{type}</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <DialogHeader className="border-b border-sidebar-border/40 pb-4">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-foreground">Reservation Details</DialogTitle>
                    <div className="flex items-center gap-2.5">
                        {/* {getStatusBadge()} */}
                        {/* {getTypeBadge()} */}
                    </div>
                </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
                {(reservation.type || reservation.place_type) !== 'cowork' && (
                    <TabsList className="mb-6 grid h-10 w-full grid-cols-2">
                        <TabsTrigger value="details" className="text-sm font-medium">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="info" className="text-sm font-medium">
                            Equipment & Team
                        </TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="details" className="mt-0 space-y-5">
                    {/* Reservation Information */}
                    <Card className="border-sidebar-border/40 bg-card/90 shadow-sm dark:bg-neutral-800/90">
                        <CardContent className="px-5 py-5">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {reservation.user_name && (
                                    <div className="space-y-2">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <Tag className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            User
                                        </div>
                                        <div className="text-sm leading-relaxed font-semibold text-foreground">{reservation.user_name}</div>
                                    </div>
                                )}

                                {(reservation.type || reservation.place_type) === 'studio' && reservation.studio_name && (
                                    <div className="space-y-2">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <Building2 className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            Studio
                                        </div>
                                        <div className="text-sm leading-relaxed font-semibold text-foreground">{reservation.studio_name}</div>
                                    </div>
                                )}

                                {reservation.table && (
                                    <div className="space-y-2">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <Table className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                            Table
                                        </div>
                                        <div className="text-sm leading-relaxed font-semibold text-foreground">Table {reservation.table}</div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        <Calendar className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                        Date
                                    </div>
                                    <div className="text-sm leading-relaxed font-semibold text-foreground">
                                        {reservation.date || reservation.day || '—'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        <Clock className="h-3.5 w-3.5 text-[var(--color-alpha)]" />
                                        Time
                                    </div>
                                    <div className="text-sm leading-relaxed font-semibold text-foreground">
                                        {reservation.start} - {reservation.end}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sidebar-border/40 pt-4">
                        {(reservation.type || reservation.place_type) !== 'cowork' && (
                            <Button
                                variant="outline"
                                className="flex cursor-pointer items-center gap-2 border-sidebar-border/50 hover:border-sidebar-border hover:bg-muted"
                                onClick={() => {
                                    router.visit(`/admin/reservations/${reservation.id}/details`);
                                }}
                            >
                                <FileText className="h-4 w-4" />
                                View Full Details
                            </Button>
                        )}

                        <div className="ml-auto flex flex-wrap items-center gap-2.5">
                            {reservation.approved && reservation.type !== 'cowork' && (
                                <Button
                                    variant="outline"
                                    className="flex cursor-pointer items-center gap-2 border-blue-500/50 bg-blue-500/90 text-white hover:border-blue-600 hover:bg-blue-600"
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
                                        router.post(
                                            `/admin/reservations/${reservation.id}/approve`,
                                            {},
                                            {
                                                onFinish: () => setLoadingAction({ id: null, type: null }),
                                            },
                                        );
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
                                        const confirmMsg = reservation.approved ? 'Cancel this approved reservation?' : 'Cancel this reservation?';
                                        if (!window.confirm(confirmMsg)) return;
                                        setLoadingAction({ id: reservation.id, type: 'cancel' });

                                        const cancelRoute =
                                            reservation.type === 'cowork'
                                                ? `/admin/reservations/cowork/${reservation.id}/cancel`
                                                : `/admin/reservations/${reservation.id}/cancel`;

                                        router.post(
                                            cancelRoute,
                                            {},
                                            {
                                                onFinish: () => setLoadingAction({ id: null, type: null }),
                                            },
                                        );
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {(reservation.type || reservation.place_type) !== 'cowork' && (
                    <TabsContent value="info" className="mt-0 space-y-5">
                        <Card className="border-sidebar-border/40 bg-card/90 shadow-sm dark:bg-neutral-800/90">
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
