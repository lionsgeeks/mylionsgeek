import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = ({ events = [], onEventClick }) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const handleEventClick = (info) => {
        if (onEventClick && info.event.extendedProps?.taskId) {
            onEventClick(info.event.extendedProps.taskId);
        }
    };

    return (
        <div className="h-[50vh] mb-6">
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                slotDuration="0:30:00"
                allDaySlot={false}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                }}
                height="100%"
                events={events}
                eventContent={(eventInfo) => {
                    const progress = eventInfo.event.extendedProps?.progress;
                    const showProgress = progress !== undefined && progress > 0;
                    
                    return (
                        <div className="p-1 flex flex-col h-full">
                            <div className="text-xs font-medium truncate flex-1">{eventInfo.event.title}</div>
                            {showProgress && (
                                <div className="w-full mt-2 pt-2 border-t border-white/20">
                                    <div className="w-full bg-white/30 dark:bg-black/30 rounded-full h-1.5">
                                        <div 
                                            className="bg-white h-1.5 rounded-full transition-all duration-300" 
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
