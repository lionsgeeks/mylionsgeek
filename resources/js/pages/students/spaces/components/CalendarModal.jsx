import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarModal = ({
    isOpen,
    onClose,
    calendarFor,
    events,
    loadingEvents,
    onDateSelect,
    onEventClick,
    onAddReservationClick,
    selectAllow,
}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!calendarFor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[90vh] p-0 bg-light dark:bg-dark">
                <div className="flex flex-col w-full h-full">
                    <div className="shrink-0 px-5 pr-14 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                        <h2 className="text-base font-medium">Calendar - {calendarFor.name}</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onAddReservationClick}
                                className="px-4 py-2 bg-alpha text-black rounded-md font-medium"
                            >
                                + Add Reservation
                            </button>
                        </div>
                    </div>
                    <div className="relative grow overflow-hidden">
                        {loadingEvents && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
                                <svg className="h-10 w-10 animate-spin text-[#FFC801]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                <p className="mt-3 text-sm font-medium">Loading calendar…</p>
                            </div>
                        )}
                        <div className={`absolute inset-0 px-4 pb-4 bg-light dark:bg-dark transition-opacity duration-200 ${loadingEvents ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <FullCalendar
                                plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                                initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                                initialDate={isMobile ? new Date() : undefined}
                                headerToolbar={{ left: 'prev,next today', center: 'title', right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                events={events}
                                selectable={true}
                                selectMirror={true}
                                selectAllow={selectAllow}
                                select={onDateSelect}
                                eventClick={onEventClick}
                                selectOverlap={true}
                                editable={false}
                                height="100%"
                                eventColor="#FFC801"
                                eventTextColor="#000000"
                                slotMinTime="08:00:00"
                                slotMaxTime="18:30:00"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CalendarModal;

