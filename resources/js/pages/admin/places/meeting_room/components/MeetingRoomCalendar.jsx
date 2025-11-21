import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModalMeetingRoom from './ReservationModalMeetingRoom';

export default function MeetingRoomCalendar({ meetingRoom, reservations = [] }) {
    const [events, setEvents] = useState(Array.isArray(reservations) ? reservations : []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectionError, setSelectionError] = useState('');

    useEffect(() => {
        setEvents(Array.isArray(reservations) ? reservations : []);
    }, [reservations]);

    const refreshReservations = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['reservations'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const preventPastSelection = useCallback((selectInfo) => {
        if (!selectInfo) return true;
        const now = new Date();
        if (selectInfo.start < now || (selectInfo.end && selectInfo.end < now)) {
            setSelectionError('You cannot select a date or time in the past.');
            return false;
        }
        setSelectionError('');
        return true;
    }, []);

    const handleDateSelect = (selectInfo) => {
        const start = selectInfo.start;
        const end = selectInfo.end;

        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);

        setSelectedRange({
            day,
            start: startTime,
            end: endTime,
        });

        setIsModalOpen(true);
    };

    const handleReservationSuccess = () => {
        setIsModalOpen(false);
        refreshReservations();
    };

    return (
        <AppLayout>
            <Head title={`Meeting Room - ${meetingRoom.name}`} />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        {meetingRoom.name}
                    </h1>
                    <p className="text-white/60">Meeting Room Calendar</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                    {isRefreshing && (
                        <div className="text-sm text-white/70 mb-2">Refreshing calendar…</div>
                    )}
                    {selectionError && (
                        <div className="mb-4 rounded-lg border border-yellow-400/60 bg-yellow-300/15 px-3 py-2 text-sm text-yellow-100">
                            {selectionError}
                        </div>
                    )}
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        selectable={true}
                        selectMirror={true}
                        selectAllow={preventPastSelection}
                        select={handleDateSelect}
                        events={events}
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        height="auto"
                        allDaySlot={false}
                    />
                </div>
            </div>

            <ReservationModalMeetingRoom
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                meetingRoom={meetingRoom}
                selectedRange={selectedRange}
                onSuccess={handleReservationSuccess}
            />
        </AppLayout>
    );
}
