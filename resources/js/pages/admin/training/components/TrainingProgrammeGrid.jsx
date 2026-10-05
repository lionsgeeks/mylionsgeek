import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeft, 
    ChevronRight, 
    Info,
    Layers,
    Edit2,
    GripVertical,
    Plus,
    Trash2,
    Calendar,
    User
} from 'lucide-react';
import ProgrammeItemModal, { COLOR_OPTIONS } from './ProgrammeItemModal';
import DeleteWeekModal from './DeleteWeekModal';
import DeleteProgrammeModal from './DeleteProgrammeModal';

const DAYS = [
    { id: 0, name: 'Monday', short: 'Mon' },
    { id: 1, name: 'Tuesday', short: 'Tue' },
    { id: 2, name: 'Wednesday', short: 'Wed' },
    { id: 3, name: 'Thursday', short: 'Thu' },
    { id: 4, name: 'Friday', short: 'Fri' },
];

const DEFAULT_WEEKS_COUNT = 28;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getWeekDateRange = (startDateInput, weekIndex) => {
    let start = new Date(startDateInput);
    if (!startDateInput || isNaN(start.getTime())) {
        start = new Date('2026-10-06');
    }

    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + weekIndex * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Monday -> Friday

    const startDD = String(weekStart.getDate()).padStart(2, '0');
    const startMMM = MONTH_NAMES[weekStart.getMonth()];
    const endDD = String(weekEnd.getDate()).padStart(2, '0');
    const endMMM = MONTH_NAMES[weekEnd.getMonth()];

    return `${startDD} ${startMMM} — ${endDD} ${endMMM}`;
};

export const getWeekStartDateStr = (baseStartDate, weekIndex) => {
    let start = new Date(baseStartDate);
    if (!baseStartDate || isNaN(start.getTime())) {
        start = new Date('2026-10-06');
    }
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + weekIndex * 7);
    const yyyy = weekStart.getFullYear();
    const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
    const dd = String(weekStart.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const calculateBaseStartDateFromWeek = (newWeekStartDateStr, weekIndex) => {
    const newStart = new Date(newWeekStartDateStr);
    if (isNaN(newStart.getTime())) return null;
    const baseStart = new Date(newStart);
    baseStart.setDate(newStart.getDate() - weekIndex * 7);
    const yyyy = baseStart.getFullYear();
    const mm = String(baseStart.getMonth() + 1).padStart(2, '0');
    const dd = String(baseStart.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const initialWeeksList = Array.from({ length: DEFAULT_WEEKS_COUNT }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    label: `Week ${i + 1}`,
    isDefault: true,
}));

export default function TrainingProgrammeGrid({
    trainingTitle = 'Training Programme',
    startDate = '2026-10-06',
    training = null,
    coaches = [],
    assignedCoach = null,
}) {
    // Programme start date state (defaults to startDate prop)
    const [gridStartDate, setGridStartDate] = useState(startDate || '2026-10-06');

    useEffect(() => {
        if (startDate) {
            setGridStartDate(startDate);
        }
    }, [startDate]);

    // Dynamic Weeks CRUD state (starts with 28 default weeks)
    const [weeks, setWeeks] = useState(initialWeeksList);
    const [editingWeekId, setEditingWeekId] = useState(null);
    const [editingWeekLabel, setEditingWeekLabel] = useState('');
    const [editingDateWeekId, setEditingDateWeekId] = useState(null);

    // Delete Week Modal state
    const [deletingWeek, setDeletingWeek] = useState(null);
    const [isDeleteWeekModalOpen, setIsDeleteWeekModalOpen] = useState(false);

    // Delete Programme Item Modal state
    const [deletingProgrammeItem, setDeletingProgrammeItem] = useState(null);
    const [isDeleteProgrammeModalOpen, setIsDeleteProgrammeModalOpen] = useState(false);

    // Initial state (empty)
    const [items, setItems] = useState([]);

    // Helper to parse Eloquent training_weeks -> sessions into grid items
    const parseTrainingItems = (trainingObj) => {
        if (!trainingObj) return [];
        const weeksList = trainingObj.training_weeks || trainingObj.trainingWeeks;
        if (!Array.isArray(weeksList)) return [];

        const loadedItems = [];
        weeksList.forEach((week) => {
            if (Array.isArray(week.sessions)) {
                week.sessions.forEach((session) => {
                    let startDay = 0;
                    let endWeek = week.week_number;
                    let endDay = 0;

                    // Parse startDay from grid format (0..4) or from session date
                    const rawStart = String(session.start_time || '').trim();
                    if (/^[0-4]$/.test(rawStart)) {
                        startDay = parseInt(rawStart, 10);
                    } else if (session.date) {
                        const d = new Date(session.date);
                        if (!isNaN(d.getTime())) {
                            const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                                startDay = dayOfWeek - 1;
                            }
                        }
                    }

                    // Parse endWeek & endDay
                    const rawEnd = String(session.end_time || '').trim();
                    if (rawEnd.includes(':')) {
                        const parts = rawEnd.split(':');
                        const ew = parseInt(parts[0], 10);
                        const ed = parseInt(parts[1], 10);
                        if (!isNaN(ew) && ew >= 1) endWeek = ew;
                        if (!isNaN(ed) && ed >= 0 && ed <= 4) endDay = ed;
                        else endDay = startDay;
                    } else if (/^[0-4]$/.test(rawEnd)) {
                        endDay = parseInt(rawEnd, 10);
                    } else {
                        endDay = startDay;
                    }

                    // Ensure startDay and endDay are bounded to valid 0..4 day indices
                    startDay = Math.max(0, Math.min(4, startDay));
                    endDay = Math.max(0, Math.min(4, endDay));

                    const firstCoach = Array.isArray(session.coaches) && session.coaches.length > 0 ? session.coaches[0] : null;

                    let color = 'blue';
                    let desc = session.description || '';
                    const colorMatch = desc.match(/\[color:([a-z]+)\]/);
                    if (colorMatch) {
                        color = colorMatch[1];
                        desc = desc.replace(/\[color:[a-z]+\]/, '').trim();
                    }

                    loadedItems.push({
                        id: session.id,
                        title: session.title,
                        description: desc,
                        color: color,
                        coach: firstCoach ? {
                            id: firstCoach.id,
                            name: firstCoach.name,
                            type: firstCoach.speciality || (firstCoach.status === 'External' ? 'External' : 'Internal'),
                        } : null,
                        startWeek: week.week_number,
                        endWeek: endWeek,
                        startDay: startDay,
                        endDay: endDay,
                    });
                });
            }
        });
        return loadedItems;
    };

    // Load persisted training items on mount and when training prop updates
    useEffect(() => {
        if (training) {
            const parsed = parseTrainingItems(training);
            setItems(parsed);

            const maxWk = parsed.reduce((max, item) => Math.max(max, item.endWeek || 1), DEFAULT_WEEKS_COUNT);
            if (maxWk > weeks.length) {
                setWeeks(Array.from({ length: maxWk }, (_, i) => ({
                    id: i + 1,
                    number: i + 1,
                    label: `Week ${i + 1}`,
                    isDefault: i < DEFAULT_WEEKS_COUNT,
                })));
            }
        }
    }, [training]);
    
    // Cell Drag selection state (for creating new items)
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null); // { week, day }
    const [selectionEnd, setSelectionEnd] = useState(null);     // { week, day }

    // Item Drag & Drop state (for moving existing items)
    const [draggingItem, setDraggingItem] = useState(null);
    const [dragStartMouse, setDragStartMouse] = useState(null); // { x, y }
    const [hasDraggedItem, setHasDraggedItem] = useState(false);
    const [hoveredCell, setHoveredCell] = useState(null); // { week, day }

    // Item Resize state (for changing block duration vertically)
    const [resizingItem, setResizingItem] = useState(null);
    const [resizeEdge, setResizeEdge] = useState(null); // 'top' or 'bottom'
    const [resizeHoveredDay, setResizeHoveredDay] = useState(null); // 0..4
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [pendingRange, setPendingRange] = useState(null);

    const scrollContainerRef = useRef(null);

    // Scroll helpers
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const amount = direction === 'left' ? -600 : 600;
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    // CREATE: Add new week handler
    const handleAddWeek = () => {
        setWeeks((prev) => {
            const nextNum = prev.length + 1;
            const newWeek = {
                id: Date.now(),
                number: nextNum,
                label: `Week ${nextNum}`,
                isDefault: false,
            };
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        left: scrollContainerRef.current.scrollWidth,
                        behavior: 'smooth',
                    });
                }
            }, 50);
            return [...prev, newWeek];
        });
    };

    // UPDATE: Rename week label handler
    const handleRenameWeek = (weekId, newLabel) => {
        if (!newLabel || !newLabel.trim()) return;
        setWeeks((prev) =>
            prev.map((w) => (w.id === weekId ? { ...w, label: newLabel.trim() } : w))
        );
    };

    // Open Delete Week Modal
    const promptDeleteWeek = (weekToDelete, e) => {
        if (e) e.stopPropagation();

        if (weekToDelete.isDefault || weekToDelete.number <= DEFAULT_WEEKS_COUNT) {
            return;
        }

        setDeletingWeek(weekToDelete);
        setIsDeleteWeekModalOpen(true);
    };

    // Confirm Delete Week Handler (removes week and affected items)
    const handleConfirmDeleteWeek = (weekToDelete) => {
        if (!weekToDelete) return;

        const affectedItems = items.filter(
            (item) => item.startWeek <= weekToDelete.number && item.endWeek >= weekToDelete.number
        );

        if (affectedItems.length > 0) {
            setItems((prev) =>
                prev.filter(
                    (item) => !(item.startWeek <= weekToDelete.number && item.endWeek >= weekToDelete.number)
                )
            );
        }

        setWeeks((prev) => {
            const filtered = prev.filter((w) => w.id !== weekToDelete.id);
            return filtered.map((w, idx) => {
                const newNum = idx + 1;
                const isDefaultPattern = /^Week \d+$/.test(w.label);
                return {
                    ...w,
                    number: newNum,
                    label: isDefaultPattern ? `Week ${newNum}` : w.label,
                };
            });
        });

        setDeletingWeek(null);
        setIsDeleteWeekModalOpen(false);
    };

    // Calculate normalized current selection bounds for continuous multi-week cell selection
    const getNormalizedSelection = () => {
        if (!selectionStart || !selectionEnd) return null;

        const startLinear = (selectionStart.week - 1) * 5 + selectionStart.day;
        const endLinear = (selectionEnd.week - 1) * 5 + selectionEnd.day;

        const minLinear = Math.min(startLinear, endLinear);
        const maxLinear = Math.max(startLinear, endLinear);

        const startWeek = Math.floor(minLinear / 5) + 1;
        const startDay = minLinear % 5;
        const endWeek = Math.floor(maxLinear / 5) + 1;
        const endDay = maxLinear % 5;

        return { minLinear, maxLinear, startWeek, endWeek, startDay, endDay };
    };

    const currentSelection = getNormalizedSelection();

    // Helper to get week segments for an item (handles multi-week spanning)
    const getItemSegments = (item) => {
        if (!item) return [];
        const segments = [];
        for (let w = item.startWeek; w <= item.endWeek; w++) {
            const isFirstWeek = w === item.startWeek;
            const isLastWeek = w === item.endWeek;
            const startDay = isFirstWeek ? item.startDay : 0;
            const endDay = isLastWeek ? item.endDay : 4;

            segments.push({
                week: w,
                startDay,
                endDay,
                isFirstWeek,
                isLastWeek,
            });
        }
        return segments;
    };

    // Calculate target drop range during item drag
    const computeTargetRange = () => {
        if (!draggingItem || !hoveredCell) return null;

        const startLinearOriginal = (draggingItem.startWeek - 1) * 5 + draggingItem.startDay;
        const endLinearOriginal = (draggingItem.endWeek - 1) * 5 + draggingItem.endDay;
        const linearSpan = endLinearOriginal - startLinearOriginal;

        let targetStartLinear = (hoveredCell.week - 1) * 5 + hoveredCell.day;
        let targetEndLinear = targetStartLinear + linearSpan;

        const maxLinear = weeks.length * 5 - 1;
        if (targetEndLinear > maxLinear) {
            targetEndLinear = maxLinear;
            targetStartLinear = Math.max(0, targetEndLinear - linearSpan);
        }
        if (targetStartLinear < 0) {
            targetStartLinear = 0;
            targetEndLinear = Math.min(maxLinear, targetStartLinear + linearSpan);
        }

        const targetStartWeek = Math.floor(targetStartLinear / 5) + 1;
        const targetStartDay = targetStartLinear % 5;
        const targetEndWeek = Math.floor(targetEndLinear / 5) + 1;
        const targetEndDay = targetEndLinear % 5;

        // Collision check with OTHER items
        const hasCollision = items.some((other) => {
            if (other.id === draggingItem.id) return false;
            const otherStartLinear = (other.startWeek - 1) * 5 + other.startDay;
            const otherEndLinear = (other.endWeek - 1) * 5 + other.endDay;
            return targetStartLinear <= otherEndLinear && targetEndLinear >= otherStartLinear;
        });

        return {
            startWeek: targetStartWeek,
            endWeek: targetEndWeek,
            startDay: targetStartDay,
            endDay: targetEndDay,
            isValid: !hasCollision,
        };
    };

    const targetRange = computeTargetRange();

    // Calculate target range during vertical item resize
    const computeResizeTargetRange = () => {
        if (!resizingItem || resizeHoveredDay === null) return null;

        let startLinear = (resizingItem.startWeek - 1) * 5 + resizingItem.startDay;
        let endLinear = (resizingItem.endWeek - 1) * 5 + resizingItem.endDay;

        const hoveredWeek = typeof resizeHoveredDay === 'object' ? resizeHoveredDay.week : resizingItem.endWeek;
        const hoveredDay = typeof resizeHoveredDay === 'object' ? resizeHoveredDay.day : resizeHoveredDay;
        const hoveredLinear = (hoveredWeek - 1) * 5 + hoveredDay;

        if (resizeEdge === 'bottom') {
            endLinear = Math.max(startLinear, Math.min(weeks.length * 5 - 1, hoveredLinear));
        } else if (resizeEdge === 'top') {
            startLinear = Math.min(endLinear, Math.max(0, hoveredLinear));
        }

        const newStartWeek = Math.floor(startLinear / 5) + 1;
        const newStartDay = startLinear % 5;
        const newEndWeek = Math.floor(endLinear / 5) + 1;
        const newEndDay = endLinear % 5;

        // Collision check with OTHER items
        const hasCollision = items.some((other) => {
            if (other.id === resizingItem.id) return false;
            const otherStartLinear = (other.startWeek - 1) * 5 + other.startDay;
            const otherEndLinear = (other.endWeek - 1) * 5 + other.endDay;
            return startLinear <= otherEndLinear && endLinear >= otherStartLinear;
        });

        return {
            startWeek: newStartWeek,
            endWeek: newEndWeek,
            startDay: newStartDay,
            endDay: newEndDay,
            isValid: !hasCollision,
        };
    };

    const resizeTargetRange = computeResizeTargetRange();

    // Mouse handlers for cell selection
    const handleCellMouseDown = (week, day, e) => {
        if (e.button !== 0 || draggingItem || resizingItem) return;
        setIsSelecting(true);
        setSelectionStart({ week, day });
        setSelectionEnd({ week, day });
    };

    const handleCellMouseEnter = (week, day) => {
        if (resizingItem) {
            setResizeHoveredDay({ week, day });
        } else if (draggingItem) {
            setHoveredCell({ week, day });
        } else if (isSelecting) {
            setSelectionEnd({ week, day });
        }
    };

    // Mouse handler for item body move drag
    const handleItemMouseDown = (item, e) => {
        if (e.button !== 0 || resizingItem) return;
        e.stopPropagation();
        setDraggingItem(item);
        setHasDraggedItem(false);
        setDragStartMouse({ x: e.clientX, y: e.clientY });
        setHoveredCell({ week: item.startWeek, day: item.startDay });
    };

    // Mouse handler for item resize handles (top/bottom edge)
    const handleResizeMouseDown = (item, edge, e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        setResizingItem(item);
        setResizeEdge(edge);
        setResizeHoveredDay(
            edge === 'bottom'
                ? { week: item.endWeek, day: item.endDay }
                : { week: item.startWeek, day: item.startDay }
        );
    };

    // Track drag distance to differentiate click vs drag, and handle global mouse up
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (draggingItem && dragStartMouse && !hasDraggedItem) {
                const dist = Math.hypot(e.clientX - dragStartMouse.x, e.clientY - dragStartMouse.y);
                if (dist > 5) {
                    setHasDraggedItem(true);
                }
            }
        };

        const handleGlobalMouseUp = () => {
            if (resizingItem) {
                if (resizeTargetRange && resizeTargetRange.isValid) {
                    const updatedItem = {
                        ...resizingItem,
                        startWeek: resizeTargetRange.startWeek,
                        endWeek: resizeTargetRange.endWeek,
                        startDay: resizeTargetRange.startDay,
                        endDay: resizeTargetRange.endDay,
                    };
                    setItems((prev) =>
                        prev.map((i) => (String(i.id) === String(resizingItem.id) ? updatedItem : i))
                    );
                    if (training?.id && typeof resizingItem.id !== 'string') {
                        router.put(`/trainings/${training.id}/programme-items/${resizingItem.id}`, updatedItem, {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }
                }
                setResizingItem(null);
                setResizeEdge(null);
                setResizeHoveredDay(null);
            } else if (isSelecting) {
                setIsSelecting(false);
                const range = getNormalizedSelection();
                if (range) {
                    setPendingRange(range);
                    setEditingItem(null);
                    setIsModalOpen(true);
                }
            } else if (draggingItem) {
                if (!hasDraggedItem) {
                    // Clicked item without dragging -> Open edit modal
                    setEditingItem(draggingItem);
                    setPendingRange(null);
                    setIsModalOpen(true);
                } else if (targetRange && targetRange.isValid) {
                    // Dragged item to valid destination -> Move item preserving duration
                    const updatedItem = {
                        ...draggingItem,
                        startWeek: targetRange.startWeek,
                        endWeek: targetRange.endWeek,
                        startDay: targetRange.startDay,
                        endDay: targetRange.endDay,
                    };
                    setItems((prev) =>
                        prev.map((i) => (String(i.id) === String(draggingItem.id) ? updatedItem : i))
                    );
                    if (training?.id && typeof draggingItem.id !== 'string') {
                        router.put(`/trainings/${training.id}/programme-items/${draggingItem.id}`, updatedItem, {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }
                }
                // Reset item drag state
                setDraggingItem(null);
                setHasDraggedItem(false);
                setDragStartMouse(null);
                setHoveredCell(null);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingItem, dragStartMouse, hasDraggedItem, isSelecting, selectionStart, selectionEnd, targetRange, resizingItem, resizeTargetRange, training]);

    // Item CRUD handlers
    const handleSaveItem = (itemData) => {
        setItems((prev) => {
            const exists = prev.some((i) => String(i.id) === String(itemData.id));
            if (exists) {
                return prev.map((i) => (String(i.id) === String(itemData.id) ? itemData : i));
            } else {
                return [...prev, itemData];
            }
        });
        setSelectionStart(null);
        setSelectionEnd(null);

        if (training?.id) {
            const isNew = typeof itemData.id === 'string' && (itemData.id.startsWith('item_') || itemData.id.startsWith('new_'));
            if (isNew) {
                router.post(`/trainings/${training.id}/programme-items`, itemData, {
                    preserveScroll: true,
                    preserveState: true,
                });
            } else {
                router.put(`/trainings/${training.id}/programme-items/${itemData.id}`, itemData, {
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }
    };

    const promptDeleteProgramme = (item) => {
        if (!item) return;
        setDeletingProgrammeItem(item);
        setIsDeleteProgrammeModalOpen(true);
    };

    const handleConfirmDeleteProgramme = (itemId) => {
        if (!itemId) return;
        setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
        setDeletingProgrammeItem(null);
        setIsDeleteProgrammeModalOpen(false);

        if (training?.id && typeof itemId !== 'string') {
            router.delete(`/trainings/${training.id}/programme-items/${itemId}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleEditItemDirect = (item, e) => {
        e.stopPropagation();
        setEditingItem(item);
        setPendingRange(null);
        setIsModalOpen(true);
    };

    // Helper to get color style configuration
    const getColorStyle = (colorId) => {
        return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
    };

    return (
        <div className="mb-10 space-y-4">
            {/* Section Header & Control Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alpha/10 border border-alpha/20 text-alpha">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
                            Training Programme
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border border-alpha/20 rounded-lg p-0.5 bg-light dark:bg-dark">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="h-7 w-7 rounded-md hover:bg-alpha/15"
                            title="Scroll Left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-[11px] font-bold px-2 text-dark/60 dark:text-light/60">Scroll Weeks</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="h-7 w-7 rounded-md hover:bg-alpha/15"
                            title="Scroll Right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Spreadsheet Grid Container (Matching Spreadsheet Controls Background) */}
            <div className="relative rounded-2xl border border-alpha/20 bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#1e1a12] shadow-sm overflow-hidden">
                {/* Horizontal Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto overflow-y-hidden select-none scrollbar-thin scrollbar-thumb-alpha/30"
                >
                    {/* CSS Grid layout for 1 Day column + N Week columns + 1 Add Week Button Column */}
                    <div
                        className="grid min-w-max"
                        style={{
                            gridTemplateColumns: `130px repeat(${weeks.length}, minmax(190px, 1fr)) 130px`,
                            gridTemplateRows: `52px repeat(5, 66px)`,
                        }}
                    >
                        {/* Top-Left Header Intersection Cell (Matching Spreadsheet Controls Background - z-40) */}
                        <div className="sticky left-0 top-0 z-40 flex items-center justify-between border-b border-r border-alpha/20 bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#44391a] px-3 font-bold uppercase tracking-wider text-[11px] text-dark/70 dark:text-light/70 shadow-sm">
                            <span>Days \ Weeks</span>
                            <span className="font-mono text-[10px] text-dark/50 dark:text-light/50">{weeks.length} Wks</span>
                        </div>

                        {/* Week Column Headers (Row 1 - Matching Spreadsheet Controls Background - z-30) */}
                        {weeks.map((week, index) => {
                            const isEditingLabel = editingWeekId === week.id;
                            const isEditingDate = editingDateWeekId === week.id;
                            const canDelete = !week.isDefault && week.number > DEFAULT_WEEKS_COUNT;

                            return (
                                <div
                                    key={`header-w-${week.id}`}
                                    className="group/week-hdr sticky top-0 z-30 flex items-center justify-between border-b border-r border-alpha/20 bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#44391a] px-2 font-extrabold text-xs text-dark dark:text-light transition-colors hover:brightness-95 dark:hover:brightness-110 shadow-sm"
                                    style={{ gridRow: 1, gridColumn: index + 2 }}
                                >
                                    {isEditingLabel ? (
                                        <input
                                            type="text"
                                            value={editingWeekLabel}
                                            onChange={(e) => setEditingWeekLabel(e.target.value)}
                                            onBlur={() => {
                                                handleRenameWeek(week.id, editingWeekLabel);
                                                setEditingWeekId(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleRenameWeek(week.id, editingWeekLabel);
                                                    setEditingWeekId(null);
                                                } else if (e.key === 'Escape') {
                                                    setEditingWeekId(null);
                                                }
                                            }}
                                            autoFocus
                                            className="w-full rounded border border-alpha bg-light px-1 py-0.5 text-xs text-dark font-extrabold focus:outline-none dark:bg-dark dark:text-light"
                                        />
                                    ) : (
                                        <div className="flex w-full items-center justify-between gap-1 overflow-hidden">
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span
                                                    className="truncate cursor-pointer hover:underline font-extrabold text-xs text-dark dark:text-light leading-tight"
                                                    title="Click to rename week label"
                                                    onClick={() => {
                                                        setEditingWeekId(week.id);
                                                        setEditingWeekLabel(week.label);
                                                    }}
                                                >
                                                    {week.label}
                                                </span>

                                                {isEditingDate ? (
                                                    <input
                                                        type="date"
                                                        value={getWeekStartDateStr(gridStartDate, index)}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val) {
                                                                const newBase = calculateBaseStartDateFromWeek(val, index);
                                                                if (newBase) {
                                                                    setGridStartDate(newBase);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={() => setEditingDateWeekId(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                                setEditingDateWeekId(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                        className="w-full rounded border border-alpha bg-light px-1 py-0.5 text-[10px] font-semibold text-alpha focus:outline-none dark:bg-dark"
                                                    />
                                                ) : (
                                                    <span
                                                        className="font-mono text-[11px] font-semibold text-alpha leading-tight truncate cursor-pointer hover:underline flex items-center gap-1"
                                                        title="Click to edit starting date"
                                                        onClick={() => setEditingDateWeekId(week.id)}
                                                    >
                                                        <Calendar className="h-2.5 w-2.5 shrink-0 opacity-70" />
                                                        <span>{getWeekDateRange(gridStartDate, index)}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover/week-hdr:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingWeekId(week.id);
                                                        setEditingWeekLabel(week.label);
                                                    }}
                                                    className="p-0.5 text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light rounded"
                                                    title="Rename week label"
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingDateWeekId(week.id)}
                                                    className="p-0.5 text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light rounded"
                                                    title="Edit starting date"
                                                >
                                                    <Calendar className="h-3 w-3" />
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => promptDeleteWeek(week, e)}
                                                        className="p-0.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded"
                                                        title="Delete week"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* "+ Add Week" Button at the End of Week Headers (Row 1, Col weeks.length + 2) */}
                        <div
                            className="sticky top-0 z-30 flex items-center justify-center border-b border-r border-alpha/20 bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#44391a] p-1 shadow-sm"
                            style={{ gridRow: 1, gridColumn: weeks.length + 2 }}
                        >
                            <Button
                                type="button"
                                onClick={handleAddWeek}
                                variant="ghost"
                                size="sm"
                                className="w-full h-full text-xs font-bold text-alpha hover:bg-alpha/15 hover:text-alpha flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-alpha/40"
                                title="Add Week"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Week</span>
                            </Button>
                        </div>

                        {/* Day Row Sticky Labels (Col 1, Rows 2..6 - Matching Spreadsheet Controls Background - z-30) */}
                        {DAYS.map((day) => (
                            <div
                                key={`label-d-${day.id}`}
                                className="sticky left-0 z-30 flex flex-col justify-center border-b border-r border-alpha/20 bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#44391a] px-3 text-xs font-bold text-dark dark:text-light shadow-sm"
                                style={{ gridRow: day.id + 2, gridColumn: 1 }}
                            >
                                <span className="text-dark dark:text-light font-bold">{day.name}</span>
                            </div>
                        ))}

                        {/* Empty Row End Placeholders for Add Week Column (Col weeks.length + 2, Rows 2..6) */}
                        {DAYS.map((day) => (
                            <div
                                key={`add-col-placeholder-${day.id}`}
                                className="border-b border-r border-alpha/10 bg-[color-mix(in_srgb,var(--color-alpha)_3%,var(--color-light))] dark:bg-[#2b2415] opacity-40"
                                style={{ gridRow: day.id + 2, gridColumn: weeks.length + 2 }}
                            />
                        ))}

                        {/* N Weeks x 5 Days Clean Cell Grid (Matching Spreadsheet Controls Background) */}
                        {weeks.map((weekObj, index) => {
                            const weekNum = index + 1;
                            return DAYS.map((day) => {
                                const cellLinear = (weekNum - 1) * 5 + day.id;
                                const isSelected =
                                    currentSelection &&
                                    cellLinear >= currentSelection.minLinear &&
                                    cellLinear <= currentSelection.maxLinear;

                                return (
                                    <div
                                        key={`cell-w${weekObj.id}-d${day.id}`}
                                        onMouseDown={(e) => handleCellMouseDown(weekNum, day.id, e)}
                                        onMouseEnter={() => handleCellMouseEnter(weekNum, day.id)}
                                        className={`relative border-b border-r border-alpha/15 transition-colors cursor-crosshair ${
                                            isSelected
                                                ? 'bg-alpha/25 border-alpha ring-2 ring-alpha z-10'
                                                : 'bg-[color-mix(in_srgb,var(--color-alpha)_5%,var(--color-light))] dark:bg-[#252014] hover:bg-alpha/15'
                                        }`}
                                        style={{
                                            gridRow: day.id + 2,
                                            gridColumn: index + 2,
                                        }}
                                    />
                                );
                            });
                        })}

                        {/* Render Ghost Drop Preview during Item Move Drag */}
                        {draggingItem && hasDraggedItem && targetRange && (
                            getItemSegments(targetRange).map((seg, segIdx) => (
                                <div
                                    key={`ghost-drop-seg-${segIdx}`}
                                    className={`z-15 m-1 flex flex-col justify-between rounded-xl border-2 border-dashed p-2.5 shadow-lg pointer-events-none transition-all ${
                                        targetRange.isValid
                                            ? 'border-emerald-500 bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                                            : 'border-red-500 bg-red-500/25 text-red-900 dark:text-red-200 ring-2 ring-red-400'
                                    }`}
                                    style={{
                                        gridRow: `${seg.startDay + 2} / ${seg.endDay + 3}`,
                                        gridColumn: `${seg.week + 1} / ${seg.week + 2}`,
                                    }}
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-extrabold text-xs flex items-center justify-between">
                                            <span className="truncate">{draggingItem.title}</span>
                                            {seg.isFirstWeek && (
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                                                    {targetRange.isValid ? 'Valid Drop' : 'Occupied'}
                                                </span>
                                            )}
                                        </div>
                                        {seg.isFirstWeek && (
                                            <p className="text-[11px] font-normal opacity-90 line-clamp-1">
                                                {targetRange.isValid
                                                    ? `Move to Week ${targetRange.startWeek}`
                                                    : 'Cannot drop on occupied cells'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Render Ghost Preview during Item Vertical Resizing */}
                        {resizingItem && resizeTargetRange && (
                            getItemSegments(resizeTargetRange).map((seg, segIdx) => (
                                <div
                                    key={`ghost-resize-seg-${segIdx}`}
                                    className={`z-15 m-1 flex flex-col justify-between rounded-xl border-2 border-dashed p-2.5 shadow-lg pointer-events-none transition-all ${
                                        resizeTargetRange.isValid
                                            ? 'border-sky-500 bg-sky-500/25 text-sky-900 dark:text-sky-200 ring-2 ring-sky-400'
                                            : 'border-red-500 bg-red-500/25 text-red-900 dark:text-red-200 ring-2 ring-red-400'
                                    }`}
                                    style={{
                                        gridRow: `${seg.startDay + 2} / ${seg.endDay + 3}`,
                                        gridColumn: `${seg.week + 1} / ${seg.week + 2}`,
                                    }}
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-extrabold text-xs flex items-center justify-between">
                                            <span className="truncate">Resize: {resizingItem.title}</span>
                                            {seg.isFirstWeek && (
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                                                    {resizeTargetRange.isValid ? 'Resize Target' : 'Occupied'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Render Existing Programme Items */}
                        {items.flatMap((item) => {
                            const cStyle = getColorStyle(item.color);
                            const startLinear = (item.startWeek - 1) * 5 + item.startDay;
                            const endLinear = (item.endWeek - 1) * 5 + item.endDay;
                            const totalDaysSpan = endLinear - startLinear + 1;
                            const totalWeeksSpan = item.endWeek - item.startWeek + 1;
                            const isBeingDragged = draggingItem?.id === item.id && hasDraggedItem;
                            const isBeingResized = resizingItem?.id === item.id;
                            const segments = getItemSegments(item);

                            return segments.map((seg) => (
                                <div
                                    key={`${item.id}-seg-${seg.week}`}
                                    onMouseDown={(e) => handleItemMouseDown(item, e)}
                                    className={`group relative z-10 m-1 flex flex-col justify-between rounded-xl border-2 p-3 shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md hover:z-15 ${cStyle.bg} ${cStyle.border} ${cStyle.text} ${
                                        isBeingDragged || isBeingResized ? 'opacity-35 scale-95 ring-2 ring-alpha' : 'hover:scale-[1.01]'
                                    }`}
                                    style={{
                                        gridRow: `${seg.startDay + 2} / ${seg.endDay + 3}`,
                                        gridColumn: `${seg.week + 1} / ${seg.week + 2}`,
                                    }}
                                >
                                    {/* Top Edge Resize Handle (only on first week segment) */}
                                    {seg.isFirstWeek && (
                                        <div
                                            onMouseDown={(e) => handleResizeMouseDown(item, 'top', e)}
                                            className="absolute top-0 left-0 right-0 h-2.5 cursor-ns-resize hover:bg-black/20 dark:hover:bg-white/20 rounded-t-xl flex items-center justify-center group/resize-top z-20"
                                            title="Drag top edge to resize start day"
                                        >
                                            <div className="h-1 w-6 rounded-full bg-current opacity-30 group-hover/resize-top:opacity-100 transition-opacity" />
                                        </div>
                                    )}

                                    <div className="space-y-1 overflow-hidden pt-1.5 pb-1">
                                        <div className="flex items-start justify-between gap-1">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <GripVertical className="h-3.5 w-3.5 opacity-50 shrink-0 group-hover:opacity-100" />
                                                <h4 className="font-extrabold text-xs sm:text-sm leading-snug line-clamp-2 truncate">
                                                    {item.title} {!seg.isFirstWeek && <span className="opacity-60 text-[10px] font-normal">(cont.)</span>}
                                                </h4>
                                            </div>
                                            {seg.isFirstWeek && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={(e) => handleEditItemDirect(item, e)}
                                                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                                        title="Edit item"
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {seg.isFirstWeek && item.description && (
                                            <p className="text-xs opacity-90 line-clamp-3 leading-snug font-normal pl-4">
                                                {item.description}
                                            </p>
                                        )}

                                        {seg.isFirstWeek && item.coach && (
                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold opacity-90 pl-4 truncate">
                                                <User className="h-3 w-3 shrink-0 opacity-70" />
                                                <span className="truncate">
                                                    {typeof item.coach === 'object'
                                                        ? `${item.coach.name} (${item.coach.type || 'Internal'})`
                                                        : item.coach}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Span Badge (only on last week segment) */}
                                    {seg.isLastWeek && (
                                        <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-current/20 text-[10px] font-mono font-bold opacity-80 pb-1">
                                            <span>
                                                {totalDaysSpan === 5 && totalWeeksSpan === 1
                                                    ? 'Full Week (Mon - Fri)'
                                                    : `${DAYS[item.startDay]?.short || 'Mon'} → ${DAYS[item.endDay]?.short || 'Fri'}`}
                                            </span>
                                            <span>
                                                {totalWeeksSpan > 1 ? `${totalWeeksSpan} Wks (${totalDaysSpan}d)` : `Week ${item.startWeek}`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Bottom Edge Resize Handle (only on last week segment) */}
                                    {seg.isLastWeek && (
                                        <div
                                            onMouseDown={(e) => handleResizeMouseDown(item, 'bottom', e)}
                                            className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize hover:bg-black/20 dark:hover:bg-white/20 rounded-b-xl flex items-center justify-center group/resize-bottom z-20"
                                            title="Drag bottom edge to resize end day"
                                        >
                                            <div className="h-1 w-6 rounded-full bg-current opacity-30 group-hover/resize-bottom:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                            ));
                        })}
                    </div>
                </div>
            </div>

            {/* Grid Instruction Footer */}
            <div className="flex items-center gap-2 rounded-xl border border-alpha/15 bg-alpha/5 p-3 text-xs text-dark/80 dark:text-light/80">
                <Info className="h-4 w-4 text-alpha shrink-0" />
                <span>
                    <strong>Spreadsheet Controls:</strong> Drag block body to move across weeks • Drag top/bottom block edges to resize day duration • Drag empty cells to create a new item • Click to edit.
                </span>
            </div>

            {/* Programme Item Create / Edit Modal */}
            <ProgrammeItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setPendingRange(null);
                }}
                onSave={handleSaveItem}
                onDelete={promptDeleteProgramme}
                initialData={editingItem}
                selectionRange={pendingRange}
                coaches={coaches}
                assignedCoach={assignedCoach}
            />

            {/* Delete Week Confirmation Modal */}
            <DeleteWeekModal
                isOpen={isDeleteWeekModalOpen}
                onClose={() => {
                    setIsDeleteWeekModalOpen(false);
                    setDeletingWeek(null);
                }}
                onConfirm={handleConfirmDeleteWeek}
                week={deletingWeek}
                affectedItemsCount={
                    deletingWeek
                        ? items.filter(
                              (item) =>
                                  item.startWeek <= deletingWeek.number &&
                                  item.endWeek >= deletingWeek.number
                          ).length
                        : 0
                }
            />

            {/* Delete Programme Item Confirmation Modal */}
            <DeleteProgrammeModal
                isOpen={isDeleteProgrammeModalOpen}
                onClose={() => {
                    setIsDeleteProgrammeModalOpen(false);
                    setDeletingProgrammeItem(null);
                }}
                onConfirm={handleConfirmDeleteProgramme}
                item={deletingProgrammeItem}
            />
        </div>
    );
}
