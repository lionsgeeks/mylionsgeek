import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarModal = ({ 
    isOpen, 
    onClose, 
    place, 
    events, 
    loadingEvents, 
    onDateSelect, 
    onAddReservationClick 
}) => {
    if (!place) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="p-6 overflow-hidden"
                style={{
                    maxWidth: '95vw',
                    width: '95vw',
                    height: '85vh',
                    maxHeight: '85vh'
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Calendar - {place.name}
                    </DialogTitle>
                    <div className="flex justify-end max-md:justify-center">
                        <button
                            onClick={onAddReservationClick}
                            className="mt-3 w-fit px-4 py-2 bg-[#FFC801] text-black rounded-md dark:hover:bg-gray-200 hover:bg-gray-950 hover:text-white dark:hover:text-black cursor-pointer transition-colors duration-200 font-medium"
                        >
                            + Add Reservation
                        </button>
                    </div>
                </DialogHeader>

                {loadingEvents ? (
                    <div className="flex justify-center items-center h-96">
                        <p>Loading events...</p>
                    </div>
                ) : (
                    <div className="h-[calc(95vh-100px)]">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={events}
                            selectable={true}
                            selectMirror={true}
                            select={onDateSelect}
                            selectOverlap={false}
                            editable={false}
                            height="88%"
                            eventColor="#FFC801"
                            eventTextColor="#000000"
                            slotMinTime="08:00:00"
                            slotMaxTime="18:30:00"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CalendarModal;

