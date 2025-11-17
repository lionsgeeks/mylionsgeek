import React from 'react';
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
    onAddReservationClick
}) => {
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
                            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading events…</div>
                        )}
                        <div className="absolute inset-0 px-4 pb-4 bg-light dark:bg-dark">
                            <FullCalendar
                                plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                events={events}
                                selectable={true}
                                selectMirror={true}
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

