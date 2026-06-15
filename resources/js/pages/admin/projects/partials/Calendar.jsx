import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { UserRound } from 'lucide-react';

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
                    const assignees = eventInfo.event.extendedProps?.assignees || [];
                    const showProgress = progress !== undefined && progress > 0;

                    return (
                        <div className="flex h-full min-h-0 flex-col gap-1 p-1">
                            <div className="truncate text-xs font-semibold leading-tight">{eventInfo.event.title}</div>
                            <div className="flex min-w-0 items-center gap-1 text-[10px] leading-tight text-black/70">
                                {assignees.length > 0 ? (
                                    <>
                                        <div className="flex -space-x-1">
                                            {assignees.slice(0, 3).map((assignee) => (
                                                <div
                                                    key={assignee.id}
                                                    className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-white bg-black/10 text-[8px] font-semibold"
                                                >
                                                    {assignee.image ? (
                                                        <img src={assignee.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        assignee.name?.charAt(0) || '?'
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="truncate">{assignees.map((assignee) => assignee.name).join(', ')}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserRound className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Unassigned</span>
                                    </>
                                )}
                            </div>
                            {showProgress && (
                                <div className="mt-auto w-full border-t border-white/20 pt-1">
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
