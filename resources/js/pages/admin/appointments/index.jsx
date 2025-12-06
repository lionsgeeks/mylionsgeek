import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Clock, Calendar, User, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TablePagination from '@/components/TablePagination';

const AppointmentsIndex = ({ appointments = [], isPerson = false }) => {
    const [loadingAction, setLoadingAction] = useState({ id: null, type: null });
    const [suggestModalOpen, setSuggestModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [suggestForm, setSuggestForm] = useState({
        suggested_day: '',
        suggested_start: '',
        suggested_end: '',
        notes: '',
    });

    // Pagination
    const perPage = 4;
    const paginatedAppointments = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return appointments.slice(start, end);
    }, [appointments, currentPage]);

    const totalPages = Math.ceil(appointments.length / perPage) || 1;

    // Reset to page 1 when appointments change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [appointments.length]);

    const handleAction = async (appointmentId, action) => {
        setLoadingAction({ id: appointmentId, type: action });
        try {
            if (action === 'approve') {
                await router.post(`/admin/appointments/${appointmentId}/approve`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setLoadingAction({ id: null, type: null });
                    },
                    onError: () => {
                        setLoadingAction({ id: null, type: null });
                    },
                });
            } else if (action === 'cancel') {
                await router.post(`/admin/appointments/${appointmentId}/cancel`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setLoadingAction({ id: null, type: null });
                    },
                    onError: () => {
                        setLoadingAction({ id: null, type: null });
                    },
                });
            }
        } catch (error) {
            setLoadingAction({ id: null, type: null });
        }
    };

    const handleSuggest = (appointment) => {
        setSelectedAppointment(appointment);
        setSuggestForm({
            suggested_day: '',
            suggested_start: '',
            suggested_end: '',
            notes: '',
        });
        setSuggestModalOpen(true);
    };

    const handleSuggestSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        setLoadingAction({ id: selectedAppointment.id, type: 'suggest' });
        try {
            await router.post(`/admin/appointments/${selectedAppointment.id}/suggest-time`, suggestForm, {
                preserveScroll: true,
                onSuccess: () => {
                    setSuggestModalOpen(false);
                    setSelectedAppointment(null);
                    setLoadingAction({ id: null, type: null });
                },
                onError: () => {
                    setLoadingAction({ id: null, type: null });
                },
            });
        } catch (error) {
            setLoadingAction({ id: null, type: null });
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'default',
            approved: 'default',
            canceled: 'destructive',
            suggested: 'secondary',
        };
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            canceled: 'bg-red-100 text-red-800',
            suggested: 'bg-blue-100 text-blue-800',
        };
        return (
            <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Appointments" />
            <div className="space-y-6 py-4 px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground mt-1">
                            {isPerson ? 'Manage your appointment requests' : 'Manage all appointment requests'}
                        </p>
                    </div>
                </div>

                <Card className="bg-light text-black dark:bg-dark dark:text-white min-h-[60vh]">
                    <CardHeader>
                        <CardTitle>Appointment Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {appointments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No appointments found For you </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {paginatedAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-semibold">{apt.requester_name}</span>
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{apt.requester_email}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>{apt.day}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{apt.start} - {apt.end}</span>
                                                    </div>
                                                    {getStatusBadge(apt.status)}
                                                </div>
                                                {apt.suggested_day && (
                                                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                        <p className="text-sm font-medium text-blue-900">Suggested Time:</p>
                                                        <p className="text-sm text-blue-700">
                                                            {apt.suggested_day} from {apt.suggested_start} to {apt.suggested_end}
                                                        </p>
                                                        {apt.notes && (
                                                            <p className="text-sm text-blue-600 mt-1">{apt.notes}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {apt.status === 'pending' && isPerson && (
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleAction(apt.id, 'approve')}
                                                        disabled={loadingAction.id === apt.id && loadingAction.type === 'approve'}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleAction(apt.id, 'cancel')}
                                                        disabled={loadingAction.id === apt.id && loadingAction.type === 'cancel'}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSuggest(apt)}
                                                        disabled={loadingAction.id === apt.id && loadingAction.type === 'suggest'}
                                                    >
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        Suggest Time
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <TablePagination
                                            currentPage={currentPage}
                                            lastPage={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Suggest Time Modal */}
                <Dialog open={suggestModalOpen} onOpenChange={setSuggestModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Suggest New Time</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSuggestSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="suggested_day">Date</Label>
                                <Input
                                    id="suggested_day"
                                    type="date"
                                    value={suggestForm.suggested_day}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, suggested_day: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="suggested_start">Start Time</Label>
                                    <Input
                                        id="suggested_start"
                                        type="time"
                                        value={suggestForm.suggested_start}
                                        onChange={(e) => setSuggestForm({ ...suggestForm, suggested_start: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="suggested_end">End Time</Label>
                                    <Input
                                        id="suggested_end"
                                        type="time"
                                        value={suggestForm.suggested_end}
                                        onChange={(e) => setSuggestForm({ ...suggestForm, suggested_end: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={suggestForm.notes}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Add any additional notes..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSuggestModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loadingAction.type === 'suggest'}
                                >
                                    {loadingAction.type === 'suggest' ? 'Sending...' : 'Send Suggestion'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default AppointmentsIndex;

