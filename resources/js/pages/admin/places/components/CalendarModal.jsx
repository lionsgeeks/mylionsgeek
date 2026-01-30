import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { router } from '@inertiajs/react';

const CalendarModal = ({ isOpen, onClose, place, events, loadingEvents, onDateSelect, onAddReservationClick, selectAllow, selectionError = '' }) => {
    if (!place) return null;
    const allowSelection = selectAllow || (() => true);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="overflow-hidden bg-light p-6 dark:bg-dark"
                style={{
                    maxWidth: '95vw',
                    width: '95vw',
                    height: '85vh',
                    maxHeight: '85vh',
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Calendar - {place.name}</DialogTitle>
                    <div className="flex justify-end max-md:justify-center">
                        <button
                            onClick={onAddReservationClick}
                            className="mt-3 w-fit cursor-pointer rounded-md bg-[#FFC801] px-4 py-2 font-medium text-black transition-colors duration-200 hover:bg-gray-950 hover:text-white dark:hover:bg-gray-200 dark:hover:text-black"
                        >
                            + Add Reservation
                        </button>
                    </div>
                </DialogHeader>

                {loadingEvents ? (
                    <div className="flex h-96 items-center justify-center">
                        <p>Loading events...</p>
                    </div>
                ) : (
                    <div className="h-[calc(95vh-100px)]">
                        {selectionError && (
                            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-700/60 dark:bg-yellow-900/40 dark:text-yellow-100">
                                {selectionError}
                            </div>
                        )}
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            events={events}
                            selectable={true}
                            selectMirror={true}
                            selectAllow={allowSelection}
                            select={onDateSelect}
                            selectOverlap={false}
                            editable={false}
                            height="88%"
                            eventColor="#FFC801"
                            eventTextColor="#000000"
                            slotMinTime="08:00:00"
                            slotMaxTime="18:30:00"
                            eventClick={(info) => {
                                const eventId = info?.event?.id || info?.event?.extendedProps?.reservation_id;
                                if (!eventId) return;
                                router.visit(`/admin/reservations/${eventId}/details`);
                            }}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CalendarModal;
