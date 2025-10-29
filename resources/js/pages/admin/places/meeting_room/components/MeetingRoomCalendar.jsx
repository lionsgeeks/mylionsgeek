import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModalMeetingRoom from './components/ReservationModalMeetingRoom';

export default function MeetingRoomCalendar({ meetingRoom }) {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const response = await fetch(`/admin/places/meeting_room/${meetingRoom.id}/reservations`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load reservations:', error);
        }
    };

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
        loadReservations();
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
