import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ReservationModalCowork from '@/pages/admin/places/coworks/components/ReservationModalCowork';
import ReservationModal from '@/pages/admin/places/studios/components/ReservationModal';
import StudioSelectionModal from './components/StudioSelectionModal';
import CalendarModal from './components/CalendarModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'studio', label: 'Studios' },
    { key: 'cowork', label: 'Cowork' },
];

export default function SpacesPage() {
    const {
        studios = [],
        coworks = [],
        meetingRooms = [],
        auth,
        equipmentOptions = [],
        teamMemberOptions = [],
        events: initialEvents = [],
        calendarContext = null,
    } = usePage().props;
    const [type, setType] = useState('all');
    const [modalStudio, setModalStudio] = useState(null);
    const [modalCowork, setModalCowork] = useState(false);
    const [calendarFor, setCalendarFor] = useState(calendarContext);
    const [events, setEvents] = useState(Array.isArray(initialEvents) ? initialEvents : []);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedCoworkId, setSelectedCoworkId] = useState(null);
    const [selectedStudioId, setSelectedStudioId] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventExtras, setEventExtras] = useState({ team_members: [], equipments: [] });
    const [blockedTableIds, setBlockedTableIds] = useState([]);
    const [showStudioSelectModal, setShowStudioSelectModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);


    const breadcrumbs = [
        { title: 'Spaces', href: '/spaces' }
    ];

    const showStudios = type === 'all' || type === 'studio';
    const showCowork = type === 'all' || type === 'cowork';
    const showMeetingRooms = type === 'all';
    const isCoworkMultiCalendar = type === 'cowork' || (type === 'all' && calendarFor?.place_type === 'cowork');

    const cards = [];
    if (showStudios) {
        studios.forEach(place => cards.push({ ...place, cardType: 'studio' }));
    }
    if (showCowork) {
        // Show just one "Cowork" card in all tab
        cards.push({
            id: 'cowork-zone',
            name: 'Cowork',
            type: 'cowork',
            image: coworks[0]?.image || '',
            cardType: 'cowork',
            state: coworks.some(c => c.state),
        });
    }
    if (showMeetingRooms && Array.isArray(meetingRooms)) {
        meetingRooms.forEach((room) => {
            cards.push({
                ...room,
                cardType: 'meeting_room',
                type: 'meeting room',
            });
        });
    }

    const priorityOrder = ['Studio Image', 'Studio Podcast'];
    const orderedCards = (() => {
        if (!cards.length) return [];
        const priority = [];
        const rest = [];
        cards.forEach((card) => {
            if (card.cardType === 'studio' && priorityOrder.includes(card.name)) {
                const priorityIndex = priorityOrder.indexOf(card.name);
                priority[priorityIndex] = card;
            } else {
                rest.push(card);
            }
        });
        return [...priority.filter(Boolean), ...rest];
    })();

    const requestEvents = useCallback((params) => {
        setLoadingEvents(true);
        setEvents([]);
        setEventExtras({ team_members: [], equipments: [] });
        setSelectedEvent(null);
        setBlockedTableIds([]);
        router.get('/spaces', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['events', 'calendarContext'],
            onFinish: () => setLoadingEvents(false),
        });
    }, [router]);

    const rangesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

    const parseDateValue = (value) => {
        if (!value) return null;
        if (value instanceof Date) {
            return value.getTime();
        }
        const date = new Date(value);
        const time = date.getTime();
        return Number.isNaN(time) ? null : time;
    };

    const computeBlockedTables = useCallback((startDate, endDate, sourceEvents = events) => {
        const start = parseDateValue(startDate);
        const end = parseDateValue(endDate);
        if (start === null || end === null) return [];

        const blocked = new Set();
        sourceEvents.forEach((ev) => {
            const tableId = ev.extendedProps?.table_id ?? ev.table_id ?? ev.tableId;
            if (!tableId) return;

            const evStart = parseDateValue(ev.start);
            const evEnd = parseDateValue(ev.end);
            if (evStart === null || evEnd === null) return;

            if (rangesOverlap(evStart, evEnd, start, end)) {
                blocked.add(Number(tableId));
            }
        });

        return Array.from(blocked);
    }, [events]);

    const selectionOverlapsExisting = useCallback((startDate, endDate, sourceEvents = events) => {
        const start = parseDateValue(startDate);
        const end = parseDateValue(endDate);
        if (start === null || end === null) return false;

        return sourceEvents.some((ev) => {
            const evStart = parseDateValue(ev.start);
            const evEnd = parseDateValue(ev.end);
            if (evStart === null || evEnd === null) return false;
            return rangesOverlap(evStart, evEnd, start, end);
        });
    }, [events]);

    const selectAllowForMainCalendar = useCallback((selectInfo) => {
        if (type === 'cowork') {
            return true;
        }
        if (type === 'all' && calendarFor?.place_type === 'cowork') {
            return true;
        }
        return !selectionOverlapsExisting(selectInfo.start, selectInfo.end);
    }, [type, calendarFor, selectionOverlapsExisting]);

    const selectAllowForModal = useCallback((selectInfo) => {
        if (calendarFor?.place_type === 'cowork') {
            return true;
        }
        return !selectionOverlapsExisting(selectInfo.start, selectInfo.end);
    }, [calendarFor, selectionOverlapsExisting]);

    function handleCardClick(card) {
        if (card.cardType === 'studio') {
            const context = { place_type: 'studio', id: card.id, name: card.name };
            setSelectedRange(null);
            setCalendarFor(context);
            setBlockedTableIds([]);
            requestEvents({
                events_mode: 'place',
                event_type: 'studio',
                event_id: card.id,
            });
        } else if (card.cardType === 'cowork') {
            const context = { place_type: 'cowork', id: null, name: 'Cowork' };
            setSelectedRange(null);
            setCalendarFor(context);
            setBlockedTableIds([]);
            requestEvents({
                events_mode: 'cowork_all',
            });
        } else if (card.cardType === 'meeting_room') {
            const context = { place_type: 'meeting_room', id: card.id, name: card.name };
            setSelectedRange(null);
            setCalendarFor(context);
            setBlockedTableIds([]);
            requestEvents({
                events_mode: 'place',
                event_type: 'meeting_room',
                event_id: card.id,
            });
        }
    }

    function handleStudioSuccess() {
        setModalStudio(null);
        router.reload();
    }

    function handleCoworkSuccess() {
        setModalCowork(false);
        setBlockedTableIds([]);
        router.reload();
    }


    useEffect(() => {
        if (type === 'studio') {
            setCalendarFor(null);
            if (studios.length) {
                requestEvents({ events_mode: 'studio_all' });
            } else {
                setEvents([]);
            }
        } else if (type === 'cowork') {
            setCalendarFor(null);
            if (coworks.length) {
                requestEvents({ events_mode: 'cowork_all' });
            } else {
                setEvents([]);
            }
        } else if (type === 'all') {
            setLoadingEvents(false);
            setEvents([]);
        }
    }, [type, studios, coworks, requestEvents]);

    useEffect(() => {
        if (!isCoworkMultiCalendar) {
            setBlockedTableIds([]);
        }
    }, [isCoworkMultiCalendar]);

    useEffect(() => {
        setEvents(Array.isArray(initialEvents) ? initialEvents : []);
        if (calendarContext) {
            setCalendarFor(calendarContext);
        }
    }, [initialEvents, calendarContext]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const onCalendarDateSelect = (selectInfo) => {
        const start = selectInfo.start;
        const end = selectInfo.end;
        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);
        setSelectedRange({ day, start: startTime, end: endTime });
        if (type === 'cowork') {
            setBlockedTableIds(computeBlockedTables(start, end));
        } else {
            setBlockedTableIds([]);
        }

        if (type === 'all' && calendarFor) {
            if (calendarFor.place_type === 'studio') {
                // For all tab, directly open reservation modal
                setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                return;
            }
            if (calendarFor.place_type === 'cowork') {
                setModalCowork(true);
                return;
            }
        }

        // For studio and cowork tabs, directly open modal if selection exists
        if (type === 'studio' && selectedStudioId) {
            // In Studios tab, directly open reservation modal if studio is selected
            setModalStudio({ id: selectedStudioId, name: studios.find(s => s.id === selectedStudioId)?.name || 'Studio', cardType: 'studio' });
            return;
        }
        if (type === 'cowork') {
            // For cowork, always open modal - table selection is inside the modal
            setModalCowork(true);
            return;
        }
    };

    useEffect(() => {
        if (type === 'studio' && studios.length) {
            const first = studios[0];
            setSelectedStudioId(first.id);
        } else if (type === 'cowork') {
            setSelectedCoworkId(null);
        } else if (type === 'all') {
            setCalendarFor(null);
            setSelectedRange(null);
            setSelectedStudioId(null);
        }
        setModalStudio(null);
        setModalCowork(false);
        setShowStudioSelectModal(false);
    }, [type, studios]);



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="relative max-w-7xl mx-auto px-6 py-4">
                {loadingEvents && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 text-center px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                            <svg className="h-10 w-10 animate-spin text-[#FFC801]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Loading calendar…
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Spaces</h1>
                    <p className="text-sm text-muted-foreground mt-1">Browse available studios and cowork tables, or open a calendar to reserve.</p>
                </div>

                <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg shadow-sm mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${type === tab.key
                                    ? 'text-alpha dark:text-alpha'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-alpha dark:hover:text-alpha'
                                }`}
                            onClick={() => setType(tab.key)}
                        >
                            {tab.label}
                            {type === tab.key && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-alpha dark:bg-white"></div>
                            )}
                        </button>
                    ))}
                </div>


                {type === 'all' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        {cards.length === 0 && (
                            <div className="col-span-full text-center text-md text-gray-500 py-8">No locations to reserve found for this type.</div>
                        )}
                        {orderedCards.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => handleCardClick(place)}
                                className="relative cursor-pointer rounded-2xl overflow-hidden border border-gray-200 dark:border-sidebar-border/70 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition w-full aspect-[4/2] bg-gray-100"
                            >
                                {place.image ? (
                                    <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 grid place-items-center text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur bg-white/85 text-gray-900`}>
                                        {place.type}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/30 shadow-sm ${place.state ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                        {place.state ? 'Available' : 'Busy'}
                                    </span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                    <div className="text-white font-semibold text-start drop-shadow-sm line-clamp-1">{place.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-light dark:bg-dark rounded-2xl border border-gray-200 dark:border-sidebar-border/70 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="md:text-lg text-sm font-semibold">
                                {type === 'studio'
                                    ? 'Studio Calendar'
                                    : 'Cowork Calendar'
                                }
                            </div>


                            <button
                                className="ml-auto px-4 py-2 rounded-md text-sm font-semibold border bg-alpha text-black border-alpha hover:bg-alpha/90"
                                onClick={() => {
                                    if (type === 'studio') {
                                        // In Studios tab, open reservation modal (will show studio selection in step 1)
                                        setModalStudio({ id: null, name: '', cardType: 'studio' });
                                    } else if (type === 'cowork') {
                                        setBlockedTableIds([]);
                                        setModalCowork(true);
                                    }
                                }}
                            >
                                Add Reservation
                            </button>
                        </div>
                        {loadingEvents ? (
                            <div className="flex items-center justify-center h-[60vh]">Loading events...</div>
                        ) : (
                            <div className="h-[70vh] bg-light dark:bg-dark">
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                                    initialDate={isMobile ? new Date() : undefined}
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                    events={events}
                                    selectable={true}
                                    selectMirror={true}
                                selectAllow={selectAllowForMainCalendar}
                                    select={onCalendarDateSelect}
                                    eventClick={(info) => {
                                        const e = info.event;

                                        // Extract time slot from event
                                        const start = e.start;
                                        const end = e.end;
                                        if (start && end) {
                                            const day = start.toISOString().split('T')[0];
                                            const startTime = start.toTimeString().slice(0, 5);
                                            const endTime = end.toTimeString().slice(0, 5);
                                            setSelectedRange({ day, start: startTime, end: endTime });

                                            // For cowork, extract table ID from event title or extendedProps
                                            if (type === 'cowork') {
                                                const conflicts = computeBlockedTables(start, end);
                                                setBlockedTableIds(conflicts);
                                                // Open modal to reserve another table
                                                setModalCowork(true);
                                            } else {
                                                // For studio, navigate to details page only if user owns the reservation
                                                if (e.extendedProps?.user_id === auth?.user?.id && e.id) {
                                                    router.visit(`/reservations/${e.id}/details`);
                                                }
                                            }
                                        }
                                    }}
                                    selectOverlap={true}
                                    editable={false}
                                    height="100%"
                                    eventColor="#FFC801"
                                    eventTextColor="#000000"
                                    slotMinTime="08:00:00"
                                    slotMaxTime="18:30:00"
                                />
                            </div>
                        )}
                    </div>
                )}


                {/* Calendar Modal - For 'all' tab */}
                {type === 'all' && calendarFor && (
                    <CalendarModal
                        isOpen={!!calendarFor}
                        onClose={() => {
                            setCalendarFor(null);
                            setBlockedTableIds([]);
                        }}
                        calendarFor={calendarFor}
                        events={events}
                        loadingEvents={loadingEvents}
                        selectAllow={selectAllowForModal}
                        onDateSelect={(selectInfo) => {
                            const start = selectInfo.start;
                            const end = selectInfo.end;
                            const day = start.toISOString().split('T')[0];
                            const startTime = start.toTimeString().slice(0, 5);
                            const endTime = end.toTimeString().slice(0, 5);
                            setSelectedRange({ day, start: startTime, end: endTime });

                            if (calendarFor.place_type === 'studio') {
                                setBlockedTableIds([]);
                                setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                            } else if (calendarFor.place_type === 'cowork') {
                                setBlockedTableIds(computeBlockedTables(start, end));
                                setModalCowork(true);
                            }
                        }}
                        onEventClick={(info) => {
                            const e = info.event;

                            // For studio reservations, navigate to details page only if user owns it
                            if (calendarFor?.place_type === 'studio' && e.extendedProps?.user_id === auth?.user?.id && e.id) {
                                router.visit(`/reservations/${e.id}/details`);
                                return;
                            }

                            // For other cases, show event details only if user owns it
                            if (e.extendedProps?.user_id !== auth?.user?.id) {
                                return;
                            }
                            const extras = {
                                team_members: Array.isArray(e.extendedProps?.team_members)
                                    ? e.extendedProps.team_members
                                    : [],
                                equipments: Array.isArray(e.extendedProps?.equipments)
                                    ? e.extendedProps.equipments
                                    : [],
                            };
                            setSelectedEvent({
                                id: e.id,
                                title: e.title,
                                start: e.start?.toISOString?.() || e.start,
                                end: e.end?.toISOString?.() || e.end,
                                backgroundColor: e.backgroundColor,
                                ...extras,
                            });
                            setEventExtras(extras);
                        }}
                        onAddReservationClick={() => {
                            const now = new Date();
                            const day = now.toISOString().split('T')[0];
                            const startTime = now.toTimeString().slice(0, 5);
                            const endDate = new Date(now.getTime() + 60 * 60 * 1000);
                            const endTime = endDate.toTimeString().slice(0, 5);
                            setSelectedRange({ day, start: startTime, end: endTime });

                            if (calendarFor.place_type === 'studio') {
                                setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                            } else if (calendarFor.place_type === 'cowork') {
                                setBlockedTableIds([]);
                                setModalCowork(true);
                            }
                        }}
                    />
                )}

                {/* Cowork Reservation Modal */}
                {modalCowork && (
                    <ReservationModalCowork
                        key="cowork-modal"
                        isOpen={modalCowork}
                        onClose={() => {
                            setModalCowork(false);
                            setBlockedTableIds([]);
                        }}
                        cowork={selectedRange && selectedCoworkId ? coworks.find(c => c.id === selectedCoworkId) : null}
                        selectedRange={selectedRange}
                        coworks={coworks.filter(t => t.state).map(c => ({
                            id: c.id,
                            table: c.name?.replace('Table ', '') || c.id,
                            state: c.state,
                            image: c.image
                        }))}
                        onSuccess={() => {
                            handleCoworkSuccess();
                            setBlockedTableIds([]);
                        }}
                        allowMultiple={true}
                        blockedTableIds={blockedTableIds}
                    />
                )}

                {/* Studio Selection Modal - Only for Studios tab */}
                {showStudioSelectModal && type === 'studio' && (
                    <StudioSelectionModal
                        isOpen={showStudioSelectModal}
                        onClose={setShowStudioSelectModal}
                        studios={studios}
                        onSelectStudio={(studio) => {
                            setSelectedStudioId(studio.id);
                            setCalendarFor({ place_type: 'studio', id: studio.id, name: studio.name });
                            setShowStudioSelectModal(false);
                            setModalStudio({ id: studio.id, name: studio.name, cardType: 'studio' });
                        }}
                    />
                )}

                {/* Studio Reservation Modal */}
                {modalStudio && (
                    <ReservationModal
                        isOpen={!!modalStudio}
                        onClose={() => setModalStudio(null)}
                        studio={type === 'studio' ? null : { id: modalStudio.id || calendarFor?.id, name: modalStudio.name || calendarFor?.name }}
                        selectedRange={selectedRange}
                        onSuccess={handleStudioSuccess}
                        studios={type === 'studio' ? studios : []}
                        equipmentOptions={equipmentOptions}
                        teamMemberOptions={teamMemberOptions}
                        userRouteMode
                    />
                )}
            </div>
        </AppLayout>
    );
}
