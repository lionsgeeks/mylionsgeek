import { Dialog, DialogContent } from '@/components/ui/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useState } from 'react';

const CalendarModal = ({ isOpen, onClose, calendarFor, events, loadingEvents, onDateSelect, onEventClick, onAddReservationClick, selectAllow }) => {
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
            <DialogContent className="h-[90vh] w-[90vw] max-w-[90vw] bg-light p-0 sm:max-w-[90vw] dark:bg-dark">
                <div className="flex h-full w-full flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 pr-14">
                        <h2 className="text-base font-medium">Calendar - {calendarFor.name}</h2>
                        <div className="flex items-center gap-3">
                            <button onClick={onAddReservationClick} className="rounded-md bg-alpha px-4 py-2 font-medium text-black">
                                + Add Reservation
                            </button>
                        </div>
                    </div>
                    <div className="relative grow overflow-hidden">
                        {loadingEvents && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm">
                                <svg
                                    className="h-10 w-10 animate-spin text-[#FFC801]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                <p className="mt-3 text-sm font-medium">Loading calendar…</p>
                            </div>
                        )}
                        <div
                            className={`absolute inset-0 bg-light px-4 pb-4 transition-opacity duration-200 dark:bg-dark ${loadingEvents ? 'pointer-events-none opacity-30' : 'opacity-100'}`}
                        >
                            <FullCalendar
                                plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                                initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                                initialDate={isMobile ? new Date() : undefined}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
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
