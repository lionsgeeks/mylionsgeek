import React, { useEffect, useMemo, useState } from 'react';
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
    const { studios = [], coworks = [], auth } = usePage().props;
    const [type, setType] = useState('all');
    const [modalStudio, setModalStudio] = useState(null);
    const [modalCowork, setModalCowork] = useState(false);
    const [calendarFor, setCalendarFor] = useState(null);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedCoworkId, setSelectedCoworkId] = useState(null);
    const [selectedStudioId, setSelectedStudioId] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventExtras, setEventExtras] = useState({ team_members: [], equipments: [] });
    const [excludedTableId, setExcludedTableId] = useState(null);
    const [showStudioSelectModal, setShowStudioSelectModal] = useState(false);


    const breadcrumbs = [
        { title: 'Spaces', href: '/spaces' }
    ];

    const showStudios = type === 'all' || type === 'studio';
    const showCowork = type === 'all' || type === 'cowork';

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

    function handleCardClick(card) {
        if (card.cardType === 'studio') {
            setCalendarFor({ place_type: 'studio', id: card.id, name: card.name });
            setSelectedRange(null);
            setLoadingEvents(true);
        }
        if (card.cardType === 'cowork') {
            setSelectedCoworkId(null);
            setCalendarFor({ place_type: 'cowork', id: null, name: 'Cowork' });
            setSelectedRange(null);
            setLoadingEvents(true);
        }
    }

    function handleStudioSuccess() {
        setModalStudio(null);
        router.reload();
    }

    function handleCoworkSuccess() {
        setModalCowork(false);
        router.reload();
    }


    useEffect(() => {
        let typeToLoad = null;
        let idToLoad = null;
        let fetchAllStudios = false;
        let fetchAllCoworks = false;

        if (type === 'studio') {
            fetchAllStudios = true;
        } else if (type === 'cowork') {

            fetchAllCoworks = true;
        } else if (calendarFor) {
            typeToLoad = calendarFor.place_type;
            idToLoad = calendarFor.id;
        }

        if (fetchAllStudios) {
            setLoadingEvents(true);
            Promise.all(
                studios.map(studio =>
                    fetch(`/reservations/public-place/studio/${studio.id}`, { headers: { 'Accept': 'application/json' } })
                        .then(r => r.json())
                        .then(data => {
                            return (Array.isArray(data) ? data : []).map(event => ({
                                ...event,
                                title: `${event.title} — ${studio.name}`,
                                created_at: event.created_at || new Date().toISOString()
                            }));
                        })
                        .catch(() => [])
                )
            )
                .then(allEvents => {
                    // Sort by created_at descending
                    const sorted = allEvents.flat().sort((a, b) => {
                        const dateA = new Date(a.created_at || 0);
                        const dateB = new Date(b.created_at || 0);
                        return dateB - dateA;
                    });
                    setEvents(sorted);
                })
                .finally(() => setLoadingEvents(false));
            return;
        }

        if (fetchAllCoworks) {
            setLoadingEvents(true);
            Promise.all(
                coworks.map(cowork =>
                    fetch(`/reservations/public-place/cowork/${cowork.id}`, { headers: { 'Accept': 'application/json' } })
                        .then(r => r.json())
                        .then(data => {
                            return (Array.isArray(data) ? data : []).map(event => ({
                                ...event,
                                title: `${event.title} — ${cowork.table || `Table ${cowork.id}`}`,
                                created_at: event.created_at || new Date().toISOString(),
                                resourceId: cowork.id, // Add resourceId for grouping
                            }));
                        })
                        .catch(() => [])
                )
            )
                .then(allEvents => {
                    // Sort by created_at descending
                    const sorted = allEvents.flat().sort((a, b) => {
                        const dateA = new Date(a.created_at || 0);
                        const dateB = new Date(b.created_at || 0);
                        return dateB - dateA;
                    });
                    setEvents(sorted);
                })
                .finally(() => setLoadingEvents(false));
            return;
        }

        if (!typeToLoad || !idToLoad) return;
        setLoadingEvents(true);
        fetch(`/reservations/public-place/${typeToLoad}/${idToLoad}`, { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                const events = Array.isArray(data) ? data : [];
                // Sort by created_at descending
                const sorted = events.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                });
                setEvents(sorted);
            })
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, [type, calendarFor, selectedCoworkId, selectedStudioId, studios, coworks]);

    useEffect(() => {
        if (type === 'studio' && selectedStudioId) {
            const s = studios.find(st => st.id === selectedStudioId);
            setCalendarFor({ place_type: 'studio', id: selectedStudioId, name: s?.name || 'Studio' });
        }
    }, [selectedStudioId]);

    useEffect(() => {
        if (type === 'cowork') {
            // For cowork, we show all tables in one calendar, so no need to set calendarFor to a specific table
            setCalendarFor({ place_type: 'cowork', id: null, name: 'Cowork' });
        }
    }, [type]);

    const onCalendarDateSelect = (selectInfo) => {
        const start = selectInfo.start;
        const end = selectInfo.end;
        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);
        setSelectedRange({ day, start: startTime, end: endTime });
        // Clear excluded table when selecting empty time slot
        setExcludedTableId(null);

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
            setCalendarFor({ place_type: 'studio', id: first.id, name: first.name });
        } else if (type === 'cowork') {
            // For cowork, show all tables in one calendar - no need to select a specific table
            setSelectedCoworkId(null);
            setCalendarFor({ place_type: 'cowork', id: null, name: 'Cowork' });
        } else if (type === 'all') {
            setCalendarFor(null);
            setSelectedRange(null);
            setSelectedStudioId(null);
        }
        setModalStudio(null);
        setModalCowork(false);
        setShowStudioSelectModal(false);
    }, [type]);



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-7xl mx-auto px-6 py-8">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {cards.length === 0 && (
                            <div className="col-span-full text-center text-md text-gray-500 py-8">No locations to reserve found for this type.</div>
                        )}
                        {cards.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => handleCardClick(place)}
                                className="relative cursor-pointer rounded-2xl overflow-hidden border border-gray-200 dark:border-sidebar-border/70 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition w-full aspect-[4/3] bg-gray-100"
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
                            <div className="text-lg font-semibold">
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
                                    initialView="timeGridWeek"
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                    events={events}
                                    selectable={true}
                                    selectMirror={true}
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
                                                // Try to extract table ID from the event
                                                // Event title format: "Table X — User Name" or "Table X — User Name — Table Y"
                                                const titleMatch = e.title?.match(/Table\s+(\d+)/);
                                                if (titleMatch) {
                                                    const tableNumber = parseInt(titleMatch[1]);
                                                    // Try to find table by table number or ID
                                                    const reservedTable = coworks.find(c =>
                                                        String(c.table) === String(tableNumber) ||
                                                        c.id === tableNumber ||
                                                        String(c.id) === String(tableNumber)
                                                    );
                                                    if (reservedTable) {
                                                        setExcludedTableId(reservedTable.id);
                                                    }
                                                }
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
                        onClose={() => setCalendarFor(null)}
                        calendarFor={calendarFor}
                        events={events}
                        loadingEvents={loadingEvents}
                        onDateSelect={(selectInfo) => {
                            const start = selectInfo.start;
                            const end = selectInfo.end;
                            const day = start.toISOString().split('T')[0];
                            const startTime = start.toTimeString().slice(0, 5);
                            const endTime = end.toTimeString().slice(0, 5);
                            setSelectedRange({ day, start: startTime, end: endTime });

                            if (calendarFor.place_type === 'studio') {
                                setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                            } else if (calendarFor.place_type === 'cowork') {
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
                            setSelectedEvent({
                                id: e.id,
                                title: e.title,
                                start: e.start?.toISOString?.() || e.start,
                                end: e.end?.toISOString?.() || e.end,
                                backgroundColor: e.backgroundColor,
                            });
                            setEventExtras({ team_members: [], equipments: [] });
                            if (e.id) {
                                const tryFetch = (url) => fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
                                    .then(async (r) => {
                                        const ct = r.headers.get('content-type') || '';
                                        if (!r.ok || !ct.includes('application/json')) return null;
                                        try { return await r.json(); } catch { return null; }
                                    });
                                (async () => {
                                    let data = await tryFetch(`/admin/reservations/${e.id}/info`);
                                    if (!data) data = await tryFetch(`/reservations/${e.id}/info`);
                                    if (data) {
                                        setEventExtras({
                                            team_members: Array.isArray(data.team_members) ? data.team_members : [],
                                            equipments: Array.isArray(data.equipments) ? data.equipments : [],
                                        });
                                    }
                                })();
                            }
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
                            setExcludedTableId(null);
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
                            setExcludedTableId(null);
                        }}
                        allowMultiple={true}
                        excludedTableId={excludedTableId}
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
                        userRouteMode
                    />
                )}
            </div>
        </AppLayout>
    );
}
