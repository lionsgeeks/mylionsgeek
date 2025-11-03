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
  const { studios = [], coworks = [] } = usePage().props;
  const [type, setType] = useState('all');
  const [modalStudio, setModalStudio] = useState(null);
  const [modalCowork, setModalCowork] = useState(false);
  const [calendarFor, setCalendarFor] = useState(null); // { place_type, id, name }
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedCoworkId, setSelectedCoworkId] = useState(null);
  const [selectedStudioId, setSelectedStudioId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // calendar event details
  const [eventExtras, setEventExtras] = useState({ team_members: [], equipments: [] });

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
      // Default to first available cowork table
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

  // Load events when calendar target changes or cowork table changes
  useEffect(() => {
    // Determine source from current mode
    let typeToLoad = null;
    let idToLoad = null;
    if (type === 'studio') {
      typeToLoad = 'studio';
      idToLoad = selectedStudioId;
    } else if (type === 'cowork') {
      typeToLoad = 'cowork';
      idToLoad = selectedCoworkId;
    } else if (calendarFor) {
      typeToLoad = calendarFor.place_type;
      idToLoad = calendarFor.id;
    }
    if (!typeToLoad || !idToLoad) return;
    setLoadingEvents(true);
    fetch(`/reservations/public-place/${typeToLoad}/${idToLoad}`, { headers: { 'Accept': 'application/json' } })
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [type, calendarFor, selectedCoworkId, selectedStudioId]);

  // Keep calendar target in sync with selector changes
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
    // In inline views, don't auto-open; only auto-open when using the modal calendar (type === 'all')
    if (type === 'all') {
      if (calendarFor?.place_type === 'studio') {
        const sId = selectedStudioId ?? calendarFor.id;
        const studio = studios.find(s => s.id === sId);
        setModalStudio({ id: sId, name: studio?.name || calendarFor.name, cardType: 'studio' });
      } else if (calendarFor?.place_type === 'cowork') {
        setModalCowork(true);
      }
    }
  };

  // When switching tabs, initialize calendar for studio/cowork
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
    // Ensure no modals are open on tab switch
    setModalStudio(null);
    setModalCowork(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Spaces</h1>
        {/* Tabs/Selector */}
        <div className="flex gap-4 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-5 py-2 rounded-lg font-semibold border transition-all ${type===tab.key ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}
              onClick={() => setType(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* All: show discovery cards. Studio/Cowork: show calendar inline */}
        {type === 'all' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {cards.length === 0 && (
              <div className="col-span-full text-center text-md text-gray-500 py-8">No locations to reserve found for this type.</div>
            )}
            {cards.map((place) => (
              <div
                key={place.id}
                onClick={() => handleCardClick(place)}
                className="relative  cursor-pointer rounded-2xl overflow-hidden border border-gray-200 text-center shadow-sm hover:shadow-md transition group w-full aspect-[4/3] bg-gray-100"
              >
                {place.image ? (
                  <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-gray-400">No Image</div>
                )}
                {/* Top badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur bg-white/80 text-gray-900 ${place.type === 'studio' ? '' : ''}`}>
                    {place.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold backdrop-blur ${place.state ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    {place.state ? 'Available' : 'Busy'}
                  </span>
                </div>
                {/* Bottom name overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  <div className="text-white font-semibold text-base drop-shadow-sm line-clamp-1">{place.name}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="text-lg font-semibold">{type === 'studio' ? 'Studio Calendar' : 'Cowork Calendar'}</div>
              {type === 'studio' ? (
                <div className="min-w-[240px]">
                  <Select value={selectedStudioId ? String(selectedStudioId) : ''} onValueChange={(v)=> setSelectedStudioId(Number(v))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select studio" />
                    </SelectTrigger>
                    <SelectContent>
                      {studios.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="min-w-[240px]">
                  <Select value={selectedCoworkId ? String(selectedCoworkId) : ''} onValueChange={(v)=> setSelectedCoworkId(Number(v))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {coworks.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.table || `Table ${t.id}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <button
                className={`ml-auto px-4 py-2 rounded-md text-sm font-semibold border ${selectedRange ? 'bg-[#FFC801] text-black border-[#FFC801]' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => {
                  if (type === 'studio') {
                    const sId = selectedStudioId;
                    const studio = studios.find(s => s.id === sId);
                    setModalStudio({ id: sId, name: studio?.name || 'Studio', cardType: 'studio' });
                  } else if (type === 'cowork') {
                    setModalCowork(true);
                  }
                }}
              >
                {selectedRange ? 'Add Reservation' : 'Add Reservation'}
              </button>
            </div>
            {loadingEvents ? (
              <div className="flex items-center justify-center h-[60vh]">Loading events...</div>
            ) : (
              <div className="h-[70vh]">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                  events={events}
                  selectable={true}
                  selectMirror={true}
                  select={onCalendarDateSelect}
                  eventClick={(info) => {
                    // Normalize payload for modal
                    const e = info.event;
                    setSelectedEvent({
                      id: e.id,
                      title: e.title,
                      start: e.start?.toISOString?.() || e.start,
                      end: e.end?.toISOString?.() || e.end,
                      backgroundColor: e.backgroundColor,
                    });
                    // Load members & equipment for studio reservations if available (admin endpoint)
                    setEventExtras({ team_members: [], equipments: [] });
                    if ((type === 'studio' || (type === 'all' && calendarFor?.place_type === 'studio')) && e.id) {
                      fetch(`/admin/reservations/${e.id}/info`, { headers: { 'Accept': 'application/json' }})
                        .then(r => r.ok ? r.json() : null)
                        .then(data => {
                          if (!data) return;
                          setEventExtras({
                            team_members: Array.isArray(data.team_members) ? data.team_members : [],
                            equipments: Array.isArray(data.equipments) ? data.equipments : [],
                          });
                        })
                        .catch(() => {});
                    }
                  }}
                  selectOverlap={false}
                  editable={false}
                  height="100%"
                  eventColor="#FFC801"
                  eventTextColor="#000000"

                />
              </div>
            )}
          </div>
        )}

        {/* Calendar modal (shared) only for All view when clicking cards */}
        {type === 'all' && calendarFor && (
          <Dialog open={!!calendarFor} onOpenChange={() => setCalendarFor(null)}>
            <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[90vh] p-0">
              {calendarFor && (
                <div className="flex flex-col w-full h-full">
                  <div className="shrink-0 px-5 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                    <h2 className="text-base font-medium">Calendar - {calendarFor.name}</h2>
                    <div className="flex items-center gap-2">
                      {calendarFor.place_type === 'cowork' && (
                        <div className="min-w-[220px]">
                          <Select value={selectedCoworkId ? String(selectedCoworkId) : ''} onValueChange={(v)=> setSelectedCoworkId(Number(v))}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {coworks.map(t => (
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
                          if (calendarFor.place_type === 'studio') setModalStudio({ id: calendarFor.id, name: calendarFor.name, cardType: 'studio' });
                          if (calendarFor.place_type === 'cowork') setModalCowork(true);
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
                    <div className="absolute inset-0 px-4 pb-4">
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
                      />
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        {/* Cowork Modal */}
        {modalCowork && (
          <ReservationModalCowork
            key={selectedCoworkId || 'cowork-modal'}
            isOpen={modalCowork}
            onClose={() => setModalCowork(false)}
            cowork={calendarFor?.place_type === 'cowork' ? coworks.find(c => c.id === selectedCoworkId) : null}
            selectedRange={selectedRange}
            coworks={coworks.filter(t => t.state)}
            onSuccess={handleCoworkSuccess}
          />
        )}
        {/* Studio Modal */}
        {modalStudio && (
          <ReservationModal
            isOpen={!!modalStudio}
            onClose={() => setModalStudio(null)}
            studio={{ id: calendarFor?.id, name: calendarFor?.name }}
            selectedRange={selectedRange}
            onSuccess={handleStudioSuccess}
            userRouteMode
          />
        )}

        {/* Reservation details modal (read-only) */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-lg">
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold">Reservation details</div>
                  <div className="text-sm text-muted-foreground">{selectedEvent.title}</div>
                </div>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium">Start</div>
                        <div>{new Date(selectedEvent.start).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-medium">End</div>
                        <div>{new Date(selectedEvent.end).toLocaleString()}</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="members">
                    {eventExtras.team_members.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No members linked.</div>
                    ) : (
                      <ul className="space-y-2">
                        {eventExtras.team_members.map(m => (
                          <li key={m.id} className="flex items-center gap-2 text-sm">
                            {m.image ? <img src={m.image} alt={m.name} className="w-6 h-6 rounded-full object-cover" /> : <span className="w-6 h-6 rounded-full bg-muted inline-block" />}
                            <span>{m.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                  <TabsContent value="equipment">
                    {eventExtras.equipments.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No equipment linked.</div>
                    ) : (
                      <ul className="space-y-2">
                        {eventExtras.equipments.map(eq => (
                          <li key={eq.id} className="flex items-center gap-3 text-sm">
                            {eq.image ? <img src={eq.image} alt={eq.reference} className="w-8 h-8 rounded object-cover" /> : <span className="w-8 h-8 rounded bg-muted inline-block" />}
                            <div className="flex flex-col">
                              <span className="font-medium">{eq.reference || eq.mark}</span>
                              {eq.mark && <span className="text-xs text-muted-foreground">{eq.mark}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

