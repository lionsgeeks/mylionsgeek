import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = ({ events = [] }) => {
    return (
        <div className="h-[50vh] mb-6">
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                slotDuration="0:30:00"
                allDaySlot={false}
                headerToolbar={false}
                height="100%"
                events={events}
                eventContent={(eventInfo) => (
                    <div className="p-1">
                        <div className="text-xs font-medium truncate">{eventInfo.event.title}</div>
                        {eventInfo.event.extendedProps?.progress && (
                            <div className="w-full bg-muted rounded-full h-1 mt-1">
                                <div 
                                    className="bg-[var(--color-alpha)] h-1 rounded-full" 
                                    style={{ width: `${eventInfo.event.extendedProps.progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
                eventClick={(info) => {
                    console.log('Event clicked:', info.event.title);
                }}
                dateClick={(info) => {
                    console.log('Date clicked:', info.dateStr);
                }}
            />
        </div>
    );
};

export default Calendar;
