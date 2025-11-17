import React from 'react';
import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Download } from 'lucide-react';

const ReservationsTable = ({
    reservations,
    loadingAction,
    setLoadingAction,
    onRowClick
}) => {
    const hasNonCoworkReservations = reservations.some(r => r.type !== "cowork");

    return (
        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
            <table className="min-w-full table-auto divide-y divide-sidebar-border/70">
                <thead className="bg-secondary/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        {hasNonCoworkReservations && (
                            <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-sidebar-border/70">
                    {reservations.map((r) => (
                        <tr
                            key={r.id}
                            className="hover:bg-accent/30 cursor-pointer"
                            onClick={() => onRowClick(r)}
                        >
                            <td className="px-4 py-3 text-sm truncate">{r.user_name ?? '—'}</td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">{r.date}</td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">{r.start} - {r.end}</td>
                            <td className="px-4 py-3 text-sm capitalize">{(r.type || r.place_type)?.replace('_', ' ') ?? '—'}</td>
                            <td className="px-4 py-3 text-sm">
                                {r.canceled ? (
                                    <Badge variant="destructive">Canceled</Badge>
                                ) : r.approved ? (
                                    <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                                ) : (
                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Pending</Badge>
                                )}
                            </td>
                            <td className="py-3 text-center text-sm" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center justify-center gap-2">
                                    {/* PDF Download - Only for non-cowork approved reservations */}
                                    {r.approved && r.type !== 'cowork' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 px-2 cursor-pointer hover:bg-alpha dark:hover:bg-alpha dark:text-white"
                                            onClick={() => {
                                                window.open(`/admin/reservations/${r.id}/pdf`, '_blank');
                                            }}
                                            title="Download PDF"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {/* Approve Button - Only for non-cowork pending reservations */}
                                    {!r.canceled && !r.approved && r.type !== 'cowork' && (
                                        <Button
                                            size="sm"
                                            className="h-8 px-2 cursor-pointer bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                            disabled={loadingAction.id === r.id}
                                            onClick={() => {
                                                setLoadingAction({ id: r.id, type: 'approve' });
                                                router.post(`/admin/reservations/${r.id}/approve`, {}, {
                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                });
                                            }}
                                            title="Approve reservation"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {/* Cancel Button - For all non-canceled reservations */}
                                    {!r.canceled && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 px-2 cursor-pointer disabled:opacity-50"
                                            disabled={loadingAction.id === r.id}
                                            onClick={() => {
                                                const confirmMsg = r.approved ?
                                                    'Cancel this approved reservation?' :
                                                    'Cancel this reservation?';
                                                if (!window.confirm(confirmMsg)) return;
                                                setLoadingAction({ id: r.id, type: 'cancel' });

                                                // Use different routes for cowork vs regular reservations
                                                const cancelRoute = r.type === 'cowork'
                                                    ? `/admin/reservations/cowork/${r.id}/cancel`
                                                    : `/admin/reservations/${r.id}/cancel`;

                                                router.post(cancelRoute, {}, {
                                                    onFinish: () => setLoadingAction({ id: null, type: null })
                                                });
                                            }}
                                            title="Cancel reservation"
                                        >
                                            {r.type == "cowork" ? (
                                                <X className="h-4 w-4" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {reservations.length === 0 && (
                        <tr>
                            <td colSpan={hasNonCoworkReservations ? 6 : 5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                No reservations found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReservationsTable;

