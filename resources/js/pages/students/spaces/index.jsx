import React, { useEffect, useMemo, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ReservationModalCowork from '@/pages/admin/places/coworks/components/ReservationModalCowork';
import ReservationModal from '@/pages/admin/places/studios/components/ReservationModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

    // New state for selection modal
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [tempSelectedId, setTempSelectedId] = useState(null);

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
        cards.push({
            id: 'cowork-zone',
            name: 'Cowork Zone',
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

            const firstAvailable = coworks.find(c => c.state) || coworks[0];
            setSelectedCoworkId(firstAvailable ? firstAvailable.id : null);
            setCalendarFor({ place_type: 'cowork', id: firstAvailable ? firstAvailable.id : null, name: 'Cowork' });
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

    function handleOpenSelectionModal() {
        if (type === 'studio') {
            setTempSelectedId(selectedStudioId);
        } else if (type === 'cowork') {
            setTempSelectedId(selectedCoworkId);
        }
        setShowSelectionModal(true);
    }

    function handleConfirmSelection() {
        setShowSelectionModal(false);

        // Update the selected ID
        if (type === 'studio' || calendarFor?.place_type === 'studio') {
            setSelectedStudioId(tempSelectedId);
            const studio = studios.find(s => s.id === tempSelectedId);
            if (studio) {
                setCalendarFor({ place_type: 'studio', id: tempSelectedId, name: studio.name });
            }
            // Open reservation modal after selection
            if (selectedRange) {
                setModalStudio({ id: tempSelectedId, name: studio?.name || 'Studio', cardType: 'studio' });
            }
        } else if (type === 'cowork' || calendarFor?.place_type === 'cowork') {
            setSelectedCoworkId(tempSelectedId);
            setCalendarFor({ place_type: 'cowork', id: tempSelectedId, name: 'Cowork' });
            // Open reservation modal after selection
            if (selectedRange) {
                setModalCowork(true);
            }
        }
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
                                title: `${event.title} — ${studio.name}`
                            }));
                        })
                        .catch(() => [])
                )
            )
                .then(allEvents => {
                    setEvents(allEvents.flat());
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
                                title: `${event.title} — ${cowork.table || `Table ${cowork.id}`}`
                            }));
                        })
                        .catch(() => [])
                )
            )
                .then(allEvents => {
                    setEvents(allEvents.flat());
                })
                .finally(() => setLoadingEvents(false));
            return;
        }

        if (!typeToLoad || !idToLoad) return;
        setLoadingEvents(true);
        fetch(`/reservations/public-place/${typeToLoad}/${idToLoad}`, { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => setEvents(Array.isArray(data) ? data : []))
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
        if (type === 'cowork' && selectedCoworkId) {
            setCalendarFor({ place_type: 'cowork', id: selectedCoworkId, name: 'Cowork' });
        }
    }, [selectedCoworkId]);

    const onCalendarDateSelect = (selectInfo) => {
        const start = selectInfo.start;
        const end = selectInfo.end;
        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);
        setSelectedRange({ day, start: startTime, end: endTime });

        if (type === 'all' && calendarFor) {
            if (calendarFor.place_type === 'studio') {
                setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                return;
            }
            if (calendarFor.place_type === 'cowork') {
                setModalCowork(true);
                return;
            }
        }

        // Only show selection modal if NOT in 'all' tab
        if (type !== 'all') {
            if (type === 'studio' || calendarFor?.place_type === 'studio') {
                setTempSelectedId(selectedStudioId);
                setShowSelectionModal(true);
                return;
            }
            if (type === 'cowork' || calendarFor?.place_type === 'cowork') {
                setTempSelectedId(selectedCoworkId);
                setShowSelectionModal(true);
                return;
            }
        }
    };

    useEffect(() => {
        if (type === 'studio' && studios.length) {
            const first = studios[0];
            setSelectedStudioId(first.id);
            setCalendarFor({ place_type: 'studio', id: first.id, name: first.name });
        } else if (type === 'cowork' && coworks.length) {
            const firstAvailable = coworks.find(c => c.state) || coworks[0];
            setSelectedCoworkId(firstAvailable?.id || null);
            setCalendarFor({ place_type: 'cowork', id: firstAvailable?.id || null, name: 'Cowork' });
        } else if (type === 'all') {
            setCalendarFor(null);
            setSelectedRange(null);
        }
        setModalStudio(null);
        setModalCowork(false);
    }, [type]);



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Spaces</h1>
                    <p className="text-sm text-muted-foreground mt-1">Browse available studios and cowork tables, or open a calendar to reserve.</p>
                </div>

                <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-sidebar-border/70 p-1 bg-alpha/30 backdrop-blur-sm text-black shadow-sm mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === tab.key
                                    ? 'bg-alpha text-white shadow'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-alpha/20 dark:hover:bg-alpha/10'
                                }`}
                            onClick={() => setType(tab.key)}
                        >
                            {tab.label}
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
                                    <div className="text-white font-semibold text-base drop-shadow-sm line-clamp-1">{place.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-light dark:bg-dark rounded-2xl border border-gray-200 dark:border-sidebar-border/70 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="text-lg font-semibold">{type === 'studio' ? 'Studio Calendar' : 'Cowork Calendar'}</div>

                            <button
                                className={`ml-auto px-4 py-2 rounded-md text-sm font-semibold border ${selectedRange ? 'bg-[#FFC801] text-black border-[#FFC801]' : 'bg-white border-gray-300 text-gray-700'}`}
                                onClick={() => {
                                    if (type === 'studio') {
                                        setTempSelectedId(selectedStudioId);
                                    } else if (type === 'cowork') {
                                        setTempSelectedId(selectedCoworkId);
                                    }
                                    setShowSelectionModal(true);
                                }}
                            >
                                {selectedRange ? 'Add Reservation' : 'Add Reservation'}
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
                                        if ((type === 'studio' || (type === 'all' && calendarFor?.place_type === 'studio')) && e.id) {
                                            fetch(`/admin/reservations/${e.id}/info`, { headers: { 'Accept': 'application/json' } })
                                                .then(r => r.ok ? r.json() : null)
                                                .then(data => {
                                                    if (!data) return;
                                                    setEventExtras({
                                                        team_members: Array.isArray(data.team_members) ? data.team_members : [],
                                                        equipments: Array.isArray(data.equipments) ? data.equipments : [],
                                                    });
                                                })
                                                .catch(() => { });
                                        }
                                    }}
                                    selectOverlap={false}
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

                {/* Selection Modal - Only show when NOT in 'all' tab */}
                {showSelectionModal && type !== 'all' && (
                    <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
                        <DialogContent className="max-w-md bg-light dark:bg-dark">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">
                                        {type === 'studio' ? 'Select Studio' : 'Select Cowork Table'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose {type === 'studio' ? 'a studio' : 'a table'} to view its calendar and make a reservation
                                    </p>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {type === 'studio' ? (
                                        studios.map(studio => (
                                            <button
                                                key={studio.id}
                                                onClick={() => setTempSelectedId(studio.id)}
                                                className={`w-full p-4 rounded-lg border-2 text-left transition ${tempSelectedId === studio.id
                                                    && 'border-[#FFC801] bg-[#FFC801]/10'

                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {studio.image && (
                                                        <img
                                                            src={studio.image}
                                                            alt={studio.name}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="font-medium">{studio.name}</div>
                                                        <div className="text-xs text-muted-foreground capitalize">{studio.type}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${studio.state
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {studio.state ? 'Available' : 'Busy'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        coworks.filter(cowork => cowork.state == 1).map(cowork => (
                                            <button
                                                key={cowork.id}
                                                onClick={() => setTempSelectedId(cowork.id)}
                                                className={`w-full p-4 rounded-lg border-2 text-left transition ${tempSelectedId === cowork.id
                                                        ? 'border-[#FFC801] bg-[#FFC801]/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {cowork.image && (
                                                            <img
                                                                src={cowork.image}
                                                                alt={cowork.table || `Table ${cowork.id}`}
                                                                className="w-12 h-12 rounded object-cover"
                                                            />
                                                        )}
                                                        <div className="font-medium">
                                                            {cowork.table || `Table ${cowork.id}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowSelectionModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSelection}
                                        disabled={!tempSelectedId}
                                        className="flex-1 px-4 py-2 bg-[#FFC801] text-black rounded-md font-medium hover:bg-[#FFD633] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Selection
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Calendar Modal - For 'all' tab */}
                {type === 'all' && calendarFor && (
                    <Dialog open={!!calendarFor} onOpenChange={() => setCalendarFor(null)}>
                        <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[90vh] p-0 bg-light dark:bg-dark">
                            {calendarFor && (
                                <div className="flex flex-col w-full h-full">
                                    <div className="shrink-0 px-5 pr-14 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                                        <h2 className="text-base font-medium">Calendar - {calendarFor.name}</h2>
                                        <div className="flex items-center gap-3">
                                            {calendarFor.place_type === 'cowork' && (
                                                <div className="min-w-[220px]">
                                                    <Select value={selectedCoworkId ? String(selectedCoworkId) : ''} onValueChange={(v) => {
                                                        const newId = Number(v);
                                                        setSelectedCoworkId(newId);
                                                        setCalendarFor({ place_type: 'cowork', id: newId, name: 'Cowork' });
                                                    }}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Select table" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coworks.filter(c => c.state).map(t => (
                                                                <SelectItem key={t.id} value={String(t.id)}>{t.table || `Table ${t.id}`}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const now = new Date();
                                                    const day = now.toISOString().split('T')[0];
                                                    const startTime = now.toTimeString().slice(0, 5);
                                                    const endDate = new Date(now.getTime() + 60 * 60 * 1000);
                                                    const endTime = endDate.toTimeString().slice(0, 5);
                                                    setSelectedRange({ day, start: startTime, end: endTime });

                                                    if (calendarFor.place_type === 'studio') {
                                                        setTempSelectedId(calendarFor.id);
                                                    } else if (calendarFor.place_type === 'cowork') {
                                                        setTempSelectedId(selectedCoworkId);
                                                    }
                                                    setShowSelectionModal(true);
                                                }}
                                                className="px-4 py-2 bg-[#FFC801] text-black rounded-md font-medium"
                                            >
                                                + Add Reservation
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative grow overflow-hidden">
                                        {loadingEvents && (
                                            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading events…</div>
                                        )}
                                        <div className="absolute inset-0 px-4 pb-4 bg-light dark:bg-dark">
                                            <FullCalendar
                                                plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                                                initialView="timeGridWeek"
                                                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                                events={events}
                                                selectable={true}
                                                selectMirror={true}
                                                select={onCalendarDateSelect}
                                                eventClick={(info) => {
                                                    const e = info.event;

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
                                                selectOverlap={false}
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
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                {/* Cowork Reservation Modal */}
                {modalCowork && (
                    <ReservationModalCowork
                        key={selectedCoworkId || calendarFor?.id || 'cowork-modal'}
                        isOpen={modalCowork}
                        onClose={() => setModalCowork(false)}
                        cowork={coworks.find(c => c.id === (selectedCoworkId || calendarFor?.id))}
                        selectedRange={selectedRange}
                        coworks={coworks.filter(t => t.state)}
                        onSuccess={handleCoworkSuccess}
                    />
                )}

                {/* Studio Reservation Modal */}
                {modalStudio && (
                    <ReservationModal
                        isOpen={!!modalStudio}
                        onClose={() => setModalStudio(null)}
                        studio={{ id: modalStudio.id || calendarFor?.id, name: modalStudio.name || calendarFor?.name }}
                        selectedRange={selectedRange}
                        onSuccess={handleStudioSuccess}
                        userRouteMode
                    />
                )}
            </div>
        </AppLayout>
    );
}
