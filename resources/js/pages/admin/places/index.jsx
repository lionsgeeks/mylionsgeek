import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash, ChevronsLeft, ChevronsRight, Grid3X3, List, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReservationModal from './studios/components/ReservationModal';
import ReservationModalCowork from './coworks/components/ReservationModalCowork';
import ReservationModalMeetingRoom from './meeting_room/components/ReservationModalMeetingRoom';
import CalendarModal from './components/CalendarModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import EventDetailsModal from './components/EventDetailsModal';
import AddPlaceModal from './components/AddPlaceModal';
import EditPlaceModal from './components/EditPlaceModal';
import DeletePlaceModal from './components/DeletePlaceModal';
import illustration from "../../../../../public/assets/images/banner/studio.png"
import Banner from "@/components/banner"
import StatCard from '../../../components/StatCard';

const PlaceIndex = ({
    places = [],
    types = [],
    studioImages = [],
    meetingRoomImages = [],
    coworkImages = [],
    equipmentImages = [],
    calendarPlace = null,
    calendarEvents = [],
    equipmentOptions = [],
    teamMemberOptions = [],
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(!!calendarPlace);
    const [selectedPlace, setSelectedPlace] = useState(calendarPlace);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [calendarSelectionError, setCalendarSelectionError] = useState('');

    const requestCalendarData = (place) => {
        if (!place) return;
        setLoadingEvents(true);
        router.get('/admin/places', {
            calendar_place_type: place.place_type,
            calendar_place_id: place.id,
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['calendarPlace', 'calendarEvents'],
            onFinish: () => setLoadingEvents(false),
        });
    };

    const handleViewCalendar = (place) => {
        if (!place) return;
        setSelectedPlace(place);
        setIsCalendarOpen(true);
        requestCalendarData(place);
    };

    const preventPastCalendarSelection = useCallback((selectInfo) => {
        if (!selectInfo) return true;
        const now = new Date();
        if (selectInfo.start < now || (selectInfo.end && selectInfo.end < now)) {
            setCalendarSelectionError('You cannot select a date or time in the past.');
            return false;
        }
        setCalendarSelectionError('');
        return true;
    }, []);

    const handleDateSelect = (selectInfo) => {
        if (!preventPastCalendarSelection(selectInfo)) {
            return;
        }
        const start = selectInfo.start;
        const end = selectInfo.end;

        const day = start.toISOString().split('T')[0];
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);

        setSelectedRange({
            day,
            start: startTime,
            end: endTime,
        });

        setIsReservationModalOpen(true);
    };


    const [previewSrc, setPreviewSrc] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);
    const [deletingPlace, setDeletingPlace] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth < 768 ? "grid" : "table";
    });

    const [events, setEvents] = useState(Array.isArray(calendarEvents) ? calendarEvents : []);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        place_type: '',
        state: '',
        image: null,
    });
    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: resetEdit, errors: editErrors } = useForm({
        name: '',
        place_type: '',
        state: '',
        image: null,
    });

    const handleEdit = (place) => {
        setEditingPlace(place);
        setEditData({
            name: place.name,
            place_type: place.place_type,
            state: place.state ? '1' : '0',
            image: null,
        });
        setIsEditOpen(true);
    };

    const handleDelete = (place) => {
        setDeletingPlace(place);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPlace) {
            router.delete(`/admin/places/${deletingPlace.id}`, {
                data: { place_type: deletingPlace.place_type },
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeletingPlace(null);
                }
            });
        }
    };

    const normalizeType = (v) => String(v || '').toLowerCase().replace(/\s+/g, '_');
    const filteredPlaces = places.filter(place => {
        const matchesType = normalizeType(filterType) === 'all' || normalizeType(place.place_type) === normalizeType(filterType);
        const matchesSearch = !searchQuery || place.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Pagination (same pattern as Members)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedPlaces = filteredPlaces.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage) || 1;

    useEffect(() => {
        // Reset page when filter changes or places change
        setCurrentPage(1);
    }, [filterType, searchQuery, places]);

    useEffect(() => {
        setEvents(Array.isArray(calendarEvents) ? calendarEvents : []);
    }, [calendarEvents]);

    useEffect(() => {
        if (calendarPlace) {
            setSelectedPlace(calendarPlace);
            setIsCalendarOpen(true);
        } else {
            setSelectedPlace(null);
            setIsCalendarOpen(false);
        }
        setLoadingEvents(false);
    }, [calendarPlace]);
    ////console.log(places);
    const meetingCount = places.filter(p => p.place_type === "meeting_room").length;
    const studioCount = places.filter(p => p.place_type === "studio").length + meetingCount;
    const coworkCount = places.filter(p => p.place_type === "cowork").length;

    const statsData = [
        { title: "All places", number: places.length, icon: ArrowRight },
        { title: "Studio", number: studioCount, icon: ArrowRight },
        { title: "Cowork", number: coworkCount, icon: ArrowRight },
    ];
    return (
        <AppLayout>
            <Head title="Places" />
            <div className="p-4 md:p-6 flex flex-col gap-6 lg:gap-10">
                <Banner
                    illustration={illustration}
                />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Places</h1>
                        <p className="text-sm text-muted-foreground">{filteredPlaces.length} places</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border border-sidebar-border/70 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                        </div>
                        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black border border-[var(--color-alpha)] transition-colors hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer">
                            Add place
                        </button>
                    </div>
                </div>
                <StatCard statsData={statsData} />
                <div className="md:flex-row flex-col flex  items-center gap-4">
                    <div className="flex  items-center gap-2">
                        <Label htmlFor="search" className="text-sm font-medium">Search:</Label>
                        <Input
                            id="search"
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}

                            className=" bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#0a0a0a]/50 dark:placeholder-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-type" className="text-sm font-medium">Filter by type:</Label>
                        <Select value={filterType} onValueChange={setFilterType} >
                            <SelectTrigger className="w-48 bg-[#e5e5e5] dark:bg-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#0a0a0a]/50 dark:placeholder-white"
                            >
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {types.map((t) => (
                                    <SelectItem key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {(filterType !== 'all' || searchQuery) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setFilterType('all');
                                setSearchQuery('');
                            }}
                            className="text-xs"
                        >
                            Clear filters
                        </Button>
                    )}
                </div>

                {viewMode === 'table' ? (
                    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                        <table className="min-w-full divide-y divide-sidebar-border/70">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Photo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">State</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Calender</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70">
                                {pagedPlaces.map((e) => (
                                    <tr key={`${e.place_type}-${e.id}`} className="hover:bg-accent/30">
                                        <td className="px-4 py-3">
                                            {e.image ? (
                                                <button onClick={() => setPreviewSrc(e.image)} className="group rounded outline-hidden cursor-pointer">
                                                    <img src={e.image} alt={e.name} className="h-10 w-10 rounded object-cover transition group-hover:opacity-90" />
                                                </button>
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{e.name}</td>
                                        <td className="px-4 py-3 text-sm">{e.place_type.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${e.state ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
                                                {e.state ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                            <div className="inline-flex items-center gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewCalendar(e)}
                                                    className="h-8 px-3 cursor-pointer hover:bg-[#FFC801] dark:hover:text-black dark:hover:bg-[#FFC801]"
                                                >
                                                    View Calendar
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer border border-transparent rounded-md hover:border hover:border-[#FFC801]"
                                                    title="Edit"
                                                    onClick={() => handleEdit(e)}
                                                >
                                                    <Pencil size={18} className="h-4 w-4 text-alpha" />
                                                </button>
                                                <button
                                                    className="p-2 text-foreground/70 transition-colors duration-200 hover:bg-transparent hover:text-red-600 cursor-pointer border border-transparent rounded-md hover:border hover:border-red-600"
                                                    title="Delete"
                                                    onClick={() => handleDelete(e)}
                                                >
                                                    <Trash size={18} className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPlaces.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                            {filterType === 'all' ? 'No places yet.' : `No ${filterType.replace('_', ' ')} found.`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pagedPlaces.map((e) => (
                            <div key={`${e.place_type}-${e.id}`} onClick={() => handleViewCalendar(e)} className="rounded-xl border border-sidebar-border/70 bg-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ">
                                {/* Image fills the card header with overlays */}
                                <div className="relative h-48 w-full">
                                    {e.image ? (
                                        <div className="group w-full h-full">
                                            <img src={e.image} alt={e.name} className="w-full h-full object-cover transition group-hover:opacity-90" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-muted-foreground text-sm">No Image</span>
                                        </div>
                                    )}
                                    {/* Top-left: Type badge */}
                                    <div className="absolute top-3 left-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize backdrop-blur text-gray-900
                                            ${e.state ? 'bg-green-200' : 'bg-red-200'}`}
                                        >
                                            {e.place_type.replace('_', ' ')}
                                        </span>

                                    </div>
                                    {/* Top-right: Availability badge + actions */}
                                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                        {/* <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold backdrop-blur ${e.state ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                            {e.state ? 'Available' : 'Unavailable'}
                                        </span> */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(ev) => { ev.stopPropagation(); handleEdit(e); }}
                                                className="h-8 w-8 grid place-items-center rounded-full bg-white/85 text-gray-900 hover:bg-white shadow-sm"
                                                title="Edit"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(ev) => { ev.stopPropagation(); handleDelete(e); }}
                                                className="h-8 w-8 grid place-items-center rounded-full bg-white/85 text-red-600 hover:bg-white shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Bottom name overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-white font-semibold text-base drop-shadow-sm line-clamp-1">{e.name}</div>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-medium rounded px-2 py-1 bg-white/85 text-gray-900">
                                                Open calendar
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* No footer; card opens calendar on click */}
                            </div>
                        ))}
                        {filteredPlaces.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-12">
                                <p className="text-sm text-muted-foreground">
                                    {filterType === 'all' ? 'No places yet.' : `No ${filterType.replace('_', ' ')} found.`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex gap-5 mt-6 w-full items-center justify-center">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50"
                        aria-label="Previous page"
                    >
                        <ChevronsLeft />
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="dark:bg-light bg-beta text-light dark:text-dark p-2 rounded-lg cursor-pointer disabled:opacity-50"
                        aria-label="Next page"
                    >
                        <ChevronsRight />
                    </button>
                </div>

                {/* Galleries from storage/img folders */}
                <div className="grid gap-8">
                    {studioImages.length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium mb-3">Studios — Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {studioImages.map((src, i) => (
                                    <img key={`studio-${i}`} src={src} alt="Studio" className="h-28 w-full rounded object-cover" />
                                ))}
                            </div>
                        </div>
                    )}
                    {meetingRoomImages.length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium mb-3">Meeting Rooms — Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {meetingRoomImages.map((src, i) => (
                                    <img key={`room-${i}`} src={src} alt="Meeting room" className="h-28 w-full rounded object-cover" />
                                ))}
                            </div>
                        </div>
                    )}
                    {coworkImages.length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium mb-3">Coworks — Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {coworkImages.map((src, i) => (
                                    <img key={`cowork-${i}`} src={src} alt="Cowork" className="h-28 w-full rounded object-cover" />
                                ))}
                            </div>
                        </div>
                    )}
                    {equipmentImages.length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium mb-3">Equipments — Gallery</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {equipmentImages.map((src, i) => (
                                    <img key={`equipment-${i}`} src={src} alt="Equipment" className="h-28 w-full rounded object-cover" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ImagePreviewModal
                    isOpen={!!previewSrc}
                    onClose={() => setPreviewSrc(null)}
                    imageSrc={previewSrc}
                />

                {/* Calendar modal */}
                {/* <Dialog open={!!calendarFor} onOpenChange={() => setCalendarFor(null)}>
                    <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[90vh] p-0">
                        {calendarFor && (
                            <div className="flex flex-col w-full h-full">
                                <div className="shrink-0 px-5 py-3 border-b border-sidebar-border/70 flex items-center justify-between">
                                    <h2 className="text-base font-medium">{calendarFor.name} — Calendar</h2>
                                </div>
                                <div className="relative grow overflow-hidden">
                                    {loadingEvents && (
                                        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading events…</div>
                                    )}
                                    <div className="absolute inset-0 px-4 pb-4">
                                        <FullCalendar
                                            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                                            initialView="timeGridWeek"
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                            }}
                                            allDaySlot={true}
                                            slotMinTime="08:00:00"
                                            slotMaxTime="22:00:00"
                                            expandRows={true}
                                            selectable={true}
                                            selectMirror={true}
                                            editable={true}
                                            events={events}
                                            selectOverlap={false}
                                            eventClick={(info) => {
                                                const ev = info.event;
                                                const props = ev.extendedProps || {};
                                                setSelectedEvent({
                                                    title: ev.title,
                                                    type: props.type || calendarFor?.place_type,
                                                    date: ev.start ? ev.start.toISOString().slice(0, 10) : undefined,
                                                    start: ev.start ? ev.start.toTimeString().slice(0, 5) : undefined,
                                                    end: ev.end ? ev.end.toTimeString().slice(0, 5) : undefined,
                                                    approved: !!props.approved,
                                                    canceled: !!props.canceled,
                                                    passed: !!props.passed,
                                                    user_name: props.user_name,
                                                    description: props.description,
                                                    studio_name: props.studio_name,
                                                });
                                            }}
                                            height="100%"
                                            eventColor="#FFC801"
                                            eventTextColor="#000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog> */}

                <EventDetailsModal
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    event={selectedEvent}
                />

                <AddPlaceModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    types={types}
                    onSubmit={() => {
                        post('/admin/places', {
                            forceFormData: true,
                            onSuccess: () => { reset(); setIsAddOpen(false); },
                        });
                    }}
                />

                <EditPlaceModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    editData={editData}
                    setEditData={setEditData}
                    editErrors={editErrors}
                    editProcessing={editProcessing}
                    types={types}
                    editingPlace={editingPlace}
                    onSubmit={() => {
                        router.post(`/admin/places/${editingPlace.id}`, {
                            ...editData,
                            _method: 'put',
                        }, {
                            forceFormData: true,
                            onSuccess: () => { resetEdit(); setIsEditOpen(false); setEditingPlace(null); },
                        });
                    }}
                />

                <DeletePlaceModal
                    isOpen={isDeleteOpen}
                    onClose={() => {
                        setIsDeleteOpen(false);
                        setDeletingPlace(null);
                    }}
                    deletingPlace={deletingPlace}
                    onConfirm={confirmDelete}
                />

                <CalendarModal
                    isOpen={isCalendarOpen}
                    onClose={(open) => {
                        if (!open) {
                            setIsCalendarOpen(false);
                            setSelectedPlace(null);
                            setCalendarSelectionError('');
                            setEvents([]);
                            router.get('/admin/places', {}, {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                                only: ['calendarPlace', 'calendarEvents'],
                            });
                        } else {
                            setIsCalendarOpen(true);
                            setCalendarSelectionError('');
                        }
                    }}
                    place={selectedPlace}
                    events={events}
                    loadingEvents={loadingEvents}
                    onDateSelect={handleDateSelect}
                    onAddReservationClick={() => {
                        const now = new Date();
                        const day = now.toISOString().split('T')[0];
                        const startTime = now.toTimeString().slice(0, 5);
                        const endDate = new Date(now.getTime() + 60 * 60 * 1000);
                        const endTime = endDate.toTimeString().slice(0, 5);

                        setSelectedRange({ day, start: startTime, end: endTime });
                        setIsReservationModalOpen(true);
                    }}
                    selectAllow={preventPastCalendarSelection}
                    selectionError={calendarSelectionError}
                />

                {/* Reservation Modals */}
                {selectedPlace?.place_type === 'studio' && (
                    <ReservationModal
                        isOpen={isReservationModalOpen}
                        onClose={() => setIsReservationModalOpen(false)}
                        studio={selectedPlace}
                        selectedRange={selectedRange}
                        onSuccess={() => {
                            setIsReservationModalOpen(false);
                            requestCalendarData(selectedPlace);
                        }}
                        equipmentOptions={equipmentOptions}
                        teamMemberOptions={teamMemberOptions}
                    />
                )}

                {selectedPlace?.place_type === 'cowork' && (
                    <ReservationModalCowork
                        isOpen={isReservationModalOpen}
                        onClose={() => setIsReservationModalOpen(false)}
                        cowork={selectedPlace}
                        selectedRange={selectedRange}
                        coworks={places.filter(p => p.place_type === 'cowork').map(p => {
                            // Extract table number from name (format: "Table X") or use id
                            const tableMatch = p.name?.match(/Table\s+(\d+)/);
                            const tableNumber = tableMatch ? tableMatch[1] : (p.name?.replace('Table ', '') || p.id);
                            return {
                                id: p.id,
                                table: tableNumber,
                                state: p.state,
                                image: p.image
                            };
                        })}
                        onSuccess={() => {
                            setIsReservationModalOpen(false);
                            requestCalendarData(selectedPlace);
                        }}
                        allowMultiple={true}
                    />
                )}

                {selectedPlace?.place_type === 'meeting_room' && (
                    <ReservationModalMeetingRoom
                        isOpen={isReservationModalOpen}
                        onClose={() => setIsReservationModalOpen(false)}
                        meetingRoom={selectedPlace}
                        selectedRange={selectedRange}
                        onSuccess={() => {
                            setIsReservationModalOpen(false);
                            requestCalendarData(selectedPlace);
                        }}
                    />
                )}

            </div>
        </AppLayout>
    );
};

export default PlaceIndex;


