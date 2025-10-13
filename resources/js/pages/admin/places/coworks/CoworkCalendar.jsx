import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModalCowork from './components/ReservationModalCowork';
import { usePage } from '@inertiajs/react';



const CoworkCalendar = ({ cowork }) => {
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);

    // Load events from API
    useEffect(() => {
        loadEvents();
    }, [cowork.id]);

    const loadEvents = () => {
        setLoadingEvents(true);
        fetch(`/admin/places/cowork/${cowork.id}/reservations`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
        .then((r) => r.json())
        .then((data) => setEvents(Array.isArray(data) ? data : []))
        .catch(() => setEvents([]))
        .finally(() => setLoadingEvents(false));
    };

    const handleDateSelect = (selectInfo) => {
        const { start, end } = selectInfo;
        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0,5);
        const endTime = end.toTimeString().slice(0,5);

        setSelectedRange({ day, start: startTime, end: endTime });
        setIsReservationModalOpen(true);
    };

    const handleReservationSuccess = () => {
        setIsReservationModalOpen(false);
        setSelectedRange(null);
        loadEvents();
    };

    return (
        <AppLayout>
            <Head title={`Calendar - ${cowork.name}`} />

            <div className="px-4 py-6 sm:p-8 lg:p-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">{cowork.name} — Calendar</h1>
                        <p className="text-sm text-muted-foreground">
                            Select a time slot to create a reservation
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/places')}
                        className="cursor-pointer"
                    >
                        ← Back to Places
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                    {loadingEvents && (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            Loading events...
                        </div>
                    )}

                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        allDaySlot={false}
                        slotMinTime="08:00:00"
                        slotMaxTime="22:00:00"
                        expandRows={true}
                        selectable={true}
                        selectMirror={true}
                        selectOverlap={false}
                        editable={false}
                        events={events}
                        select={handleDateSelect}
                        height="75vh"
                        eventColor="#FFC801"
                        eventTextColor="#000000"
                    />
                </div>
            </div>

            <ReservationModalCowork
                isOpen={isReservationModalOpen}
                onClose={() => {
                    setIsReservationModalOpen(false);
                    setSelectedRange(null);
                }}
                cowork={cowork}
                selectedRange={selectedRange}
                onSuccess={handleReservationSuccess}
            />
        </AppLayout>
    );
};

export default CoworkCalendar;
