import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

const Calendar = ({ events = [] }) => {
    return (
        <div className="mb-6 h-[50vh]">
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
                        <div className="truncate text-xs font-medium">{eventInfo.event.title}</div>
                        {eventInfo.event.extendedProps?.progress && (
                            <div className="mt-1 h-1 w-full rounded-full bg-muted">
                                <div
                                    className="h-1 rounded-full bg-[var(--color-alpha)]"
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
