import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

const Calendar = ({ events = [], onEventClick }) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const handleEventClick = (info) => {
        if (onEventClick && info.event.extendedProps?.taskId) {
            onEventClick(info.event.extendedProps.taskId);
        }
    };

    return (
        <div className="mb-6 h-[50vh]">
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                slotDuration="0:30:00"
                allDaySlot={false}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: '',
                }}
                height="100%"
                events={events}
                eventContent={(eventInfo) => {
                    const progress = eventInfo.event.extendedProps?.progress;
                    const showProgress = progress !== undefined && progress > 0;

                    return (
                        <div className="flex h-full flex-col p-1">
                            <div className="flex-1 truncate text-xs font-medium">{eventInfo.event.title}</div>
                            {showProgress && (
                                <div className="mt-2 w-full border-t border-white/20 pt-2">
                                    <div className="h-1.5 w-full rounded-full bg-white/30 dark:bg-black/30">
                                        <div
                                            className="h-1.5 rounded-full bg-white transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }}
                eventClick={handleEventClick}
                dateClick={(info) => {
                    const clicked = new Date(info.dateStr);
                    clicked.setHours(0, 0, 0, 0);
                    if (clicked < startOfToday) {
                        return;
                    }
                    //('Date clicked:', info.dateStr);
                }}
            />
        </div>
    );
};

export default Calendar;
