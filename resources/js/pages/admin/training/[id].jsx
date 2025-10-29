import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Head, router } from '@inertiajs/react';
import { CalendarCheck, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Play, Plus, User, UserPlus, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// Use native fetch instead of axios
import GeekyWheel from './partials/geekyWheel';

export default function Show({ training, usersNull }) {
    const [students, setStudents] = useState(training.users || []);
    const [availableUsers, setAvailableUsers] = useState(usersNull || []);
    const [filter, setFilter] = useState('');
    const [modalFilter, setModalFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [attendanceData, setAttendanceData] = useState({});
    const [events, setEvents] = useState([]);
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
    const [showPlayDropdown, setShowPlayDropdown] = useState(false);
    const [showGeekyWheel, setShowGeekyWheel] = useState(false);
    const [wheelParticipants, setWheelParticipants] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const dropdownRef = useRef(null);
    const calendarRef = useRef(null);
    const [calendarApi, setCalendarApi] = useState(null);
    const [calendarTitle, setCalendarTitle] = useState('');

    // Map status to color styles for SelectTrigger
    const statusClass = (value) => {
        const v = String(value || '').toLowerCase();
        if (v === 'present') return 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400';
        if (v === 'absent') return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
        if (v === 'late') return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-alpha';
        if (v === 'excused') return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400';
        return '';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowPlayDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initialize FullCalendar API once mounted
    useEffect(() => {
        if (calendarRef.current && typeof calendarRef.current.getApi === 'function') {
            setCalendarApi(calendarRef.current.getApi());
        }
    }, [calendarRef]);

    // Fetch attendance events for this training
    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch(`/training/${training.id}/attendance-events`);
                const data = await res.json();
                if (Array.isArray(data.events)) {
                    setEvents(data.events.map((e) => ({ ...e })));
                }
            } catch (e) {}
        }
        fetchEvents();
    }, [training.id]);

    //   attendance

    async function AddAttendance(dateStr) {
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/attendances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    formation_id: training.id,
                    attendance_day: dateStr,
                }),
            });
            if (!res.ok) throw new Error(`Failed to create/load attendance (${res.status})`);
            const data = await res.json();

            setCurrentAttendanceId(data.attendance_id);
            const initialized = {};
            const existing = data.lists || [];
            const byUserId = new Map(existing.map((l) => [l.user_id, l]));
            students.forEach((s) => {
                const key = `${dateStr}-${s.id}`;
                const saved = byUserId.get(s.id);
                initialized[key] = {
                    morning: saved?.morning ?? 'present',
                    lunch: saved?.lunch ?? 'present',
                    evening: saved?.evening ?? 'present',
                    notes: saved?.note ? String(saved.note).split(' | ').filter(Boolean) : [],
                    user_id: s.id,
                };
            });
            setAttendanceData((prev) => ({ ...prev, ...initialized }));

            if (existing.length === 0) {
                const dataToSave = students.map((s) => ({
                    user_id: s.id,
                    attendance_day: dateStr,
                    attendance_id: Number(data.attendance_id),
                    morning: 'present',
                    lunch: 'present',
                    evening: 'present',
                    note: null,
                }));
                // fire-and-forget initialization; errors will be visible on explicit save
                fetch('/admin/attendance/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ attendance: dataToSave }),
                }).catch(() => {});
            }
            setShowAttendanceList(true);
        } catch (err) {}
    }

    //   atteandacelist
    async function handleSave() {
        const dataToSave = Object.entries(attendanceData).map(([key, value]) => {
            const studentId =
                value?.user_id ??
                (() => {
                    const i = key.lastIndexOf('-');
                    return i !== -1 ? key.slice(i + 1) : key;
                })();
            return {
                user_id: studentId,
                attendance_day: selectedDate,
                attendance_id: Number(currentAttendanceId),
                morning: value.morning,
                lunch: value.lunch,
                evening: value.evening,
                note: Array.isArray(value.notes) ? value.notes.join(' | ') : value.notes || null,
            };
        });

        try {
            if (!currentAttendanceId || !selectedDate) return;
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/admin/attendance/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ attendance: dataToSave }),
            });
            if (!res.ok) return;
            setShowAttendanceList(false);
            try {
                const evRes = await fetch(`/training/${training.id}/attendance-events`);
                const evData = await evRes.json();
                if (Array.isArray(evData.events)) setEvents(evData.events);
            } catch {}
        } catch (err) {}
    }

    // Wheel functions
    const openGeekyWheel = () => {
        setWheelParticipants([...students]);
        setSelectedWinner(null);
        setWheelRotation(0);
        setShowGeekyWheel(true);
        setShowPlayDropdown(false);
    };

    const spinWheel = () => {
        if (isSpinning || wheelParticipants.length === 0) return;

        setIsSpinning(true);
        setSelectedWinner(null);

        // Random rotation between 1800-3600 degrees (5-10 full rotations)
        const randomRotation = 1800 + Math.random() * 1800;
        const finalRotation = wheelRotation + randomRotation;

        setWheelRotation(finalRotation);

        setTimeout(() => {
            const segmentAngle = 360 / wheelParticipants.length;
            const normalizedRotation = finalRotation % 360;
            // Arrow is at 180 degrees (9 o'clock position - left side)
            // Calculate which segment the arrow is pointing to
            const winnerIndex = Math.floor((360 - normalizedRotation + 180) / segmentAngle) % wheelParticipants.length;

            setSelectedWinner(wheelParticipants[winnerIndex]);
            setIsSpinning(false);
            setShowWinnerModal(true);
        }, 5000);
    };

    const removeWinner = () => {
        if (selectedWinner) {
            setWheelParticipants((prev) => prev.filter((p) => p.id !== selectedWinner.id));
            setSelectedWinner(null);
            setShowWinnerModal(false);
        }
    };

    const resetWheel = () => {
        setWheelParticipants([...students]);
        setSelectedWinner(null);
        setWheelRotation(0);
        setShowWinnerModal(false);
    };

    const continueSpinning = () => {
        setSelectedWinner(null);
        setShowWinnerModal(false);
    };

    // Notes helpers: add/remove chip-style notes per student
    const addNote = (studentKey, noteText) => {
        const text = (noteText || '').trim();
        if (!text) return;
        setAttendanceData((prev) => {
            const prevForStudent = prev[studentKey] || { morning: 'present', lunch: 'present', evening: 'present', notes: [] };
            const existingNotes = Array.isArray(prevForStudent.notes) ? prevForStudent.notes : prevForStudent.notes ? [prevForStudent.notes] : [];
            return {
                ...prev,
                [studentKey]: {
                    ...prevForStudent,
                    notes: [...existingNotes, text],
                },
            };
        });
    };

    const removeNote = (studentKey, index) => {
        setAttendanceData((prev) => {
            const prevForStudent = prev[studentKey] || { morning: 'present', lunch: 'present', evening: 'present', notes: [] };
            const existingNotes = Array.isArray(prevForStudent.notes)
                ? [...prevForStudent.notes]
                : prevForStudent.notes
                  ? [prevForStudent.notes]
                  : [];
            existingNotes.splice(index, 1);
            return {
                ...prev,
                [studentKey]: {
                    ...prevForStudent,
                    notes: existingNotes,
                },
            };
        });
    };
    // Filter enrolled students
    const filteredStudents = students.filter(
        (s) => s.name.toLowerCase().includes(filter.toLowerCase()) || s.email.toLowerCase().includes(filter.toLowerCase()),
    );

    // Filter available users to exclude admins, coaches, and already assigned students
    const filteredAvailableUsers = availableUsers.filter((user) => {
        // Exclude admins (assuming role field exists)
        if (user.role.includes('admin')) return false;

        // Exclude coaches (assuming role field exists)
        if (user.role.includes('coach')) return false;

        // Exclude users already assigned to this training
        const isAlreadyAssigned = students.some((student) => student.id === user.id);
        if (isAlreadyAssigned) return false;

        // Apply search filter
        if (modalFilter) {
            const searchTerm = modalFilter.toLowerCase();
            if (!user.name.toLowerCase().includes(searchTerm)) return false;
        }

        return true;
    });

    // Delete student

    // Add student from modal
    const handleAddStudent = (user) => {
        router.post(
            `/trainings/${training.id}/students`,
            { student_id: user.id },
            {
                onSuccess: () => {
                    setStudents((prev) => [...prev, user]);
                    setAvailableUsers((prev) => prev.filter((u) => u.id !== user.id));
                },
            },
        );
    };
    const handleDelete = (userId) => {
        const student = students.find((s) => s.id === userId);
        setStudentToDelete(student);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            router.delete(`/trainings/${training.id}/students/${studentToDelete.id}`, {
                onSuccess: () => {
                    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
                    setAvailableUsers((prev) => [...prev, studentToDelete]);
                    setShowDeleteConfirm(false);
                    setStudentToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title={training.name} />

            <div className="min-h-screen p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl leading-tight font-extrabold break-words text-dark sm:text-3xl dark:text-light">{training.name}</h1>
                        <p className="mt-1 text-dark/70 sm:mt-2 dark:text-light/70">{training.category}</p>
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] sm:flex-none"
                        >
                            <Plus size={16} />
                            <span>Add Student</span>
                        </Button>
                        <Button
                            onClick={() => setShowAttendance(true)}
                            className="flex-1 gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)] sm:flex-none"
                        >
                            <CalendarCheck size={16} />
                            <span>Attendance</span>
                        </Button>

                        {/* Play Dropdown */}
                        <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
                            <Button
                                onClick={() => setShowPlayDropdown(!showPlayDropdown)}
                                className="w-full gap-2 border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black transition-all duration-300 hover:bg-transparent hover:text-[var(--color-alpha)] sm:w-auto"
                            >
                                <Play size={16} />
                                <span className="hidden sm:inline">Play</span>
                                <ChevronDown
                                    size={16}
                                    className={`transform transition-transform duration-300 ${showPlayDropdown ? 'rotate-180' : ''}`}
                                />
                            </Button>

                            {showPlayDropdown && (
                                <div className="absolute right-0 z-50 mt-2 w-full rounded-xl border border-alpha/20 bg-light text-dark shadow-xl duration-200 animate-in slide-in-from-top-2 sm:w-48 dark:bg-dark dark:text-light">
                                    <button
                                        onClick={openGeekyWheel}
                                        className="w-full rounded-t-xl px-4 py-3 text-left font-semibold text-dark transition-colors hover:bg-alpha/10 dark:text-light"
                                    >
                                        Geeky Wheel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPlayDropdown(false);
                                            router.visit(`/training/${training.id}/geeko`);
                                        }}
                                        className="w-full rounded-b-xl px-4 py-3 text-left font-semibold text-dark transition-colors hover:bg-alpha/10 dark:text-light"
                                    >
                                        Geeko
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="mb-8 h-64 w-full overflow-hidden rounded-2xl border border-alpha/20">
                    {training.img ? (
                        <img
                            src={
                                training.category?.toLowerCase() === 'coding'
                                    ? '/assets/images/training/coding.jpg'
                                    : training.category?.toLowerCase() === 'media'
                                      ? '/assets/images/training/media.jpg'
                                      : training.img
                                        ? `/storage/img/training/${training.img}`
                                        : '/assets/images/training/default.jpg'
                            }
                            alt={training.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-alpha to-alpha/70 text-xl font-bold text-light">
                            {training.name}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Side – Students List */}
                    <div className="space-y-6 lg:col-span-2">
                        {students.length > 0 && (
                            <div className="rounded-2xl border border-alpha/20 bg-light p-6 text-dark dark:bg-dark dark:text-light">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Enrolled Students ({students.length})</h2>
                                </div>

                                {/* Filter Input */}
                                <Input
                                    type="text"
                                    placeholder="Filter by name or email..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="mb-6"
                                />

                                <ul className="space-y-3">
                                    {filteredStudents.map((user) => (
                                        <li key={user.id} className="flex items-center justify-between space-x-3">
                                            <div
                                                className="flex flex-1 cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-alpha/5"
                                                onClick={() => router.visit(`/admin/users/${user.id}`)}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-alpha font-bold text-light">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-dark dark:text-light">{user.name}</p>
                                                    <p className="text-sm text-dark/70 dark:text-light/70">{user.email}</p>
                                                    <button
                                                        className="mt-1 inline-block text-xs text-red-600 hover:text-red-700 md:hidden"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(user.id);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDelete(user.id)}
                                                className="hidden gap-1 border-red-600 px-3 py-1 text-red-600 hover:bg-red-50 md:inline-flex dark:hover:bg-red-900/10"
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Side – Info */}
                    <div className="space-y-6">
                        {/* Coach Card */}
                        <div className="flex items-center space-x-4 rounded-2xl border border-alpha/20 bg-light p-6 dark:bg-dark">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-alpha text-lg font-bold text-light">
                                {training.coach
                                    ? training.coach.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')
                                          .toUpperCase()
                                    : 'C'}
                            </div>
                            <div>
                                <p className="font-bold text-dark dark:text-light">{training.coach?.name || 'Expert Instructor'}</p>
                                <p className="text-sm text-dark/70 dark:text-light/70">{training.coach?.speciality || 'Professional Mentor'}</p>
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="space-y-4 rounded-2xl border border-alpha/20 bg-light p-6 dark:bg-dark">
                            <div className="flex items-center space-x-3">
                                <CalendarDays className="text-alpha" />
                                <div>
                                    <p className="text-sm text-dark/70 dark:text-light/70">Start Time</p>
                                    <p className="font-bold text-dark dark:text-light">{training.start_time || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Users className="text-alpha" />
                                <div>
                                    <p className="text-sm text-dark/70 dark:text-light/70">Enrolled Students</p>
                                    <p className="font-bold text-dark dark:text-light">{students.length}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <User className="text-alpha" />
                                <div>
                                    <p className="text-sm text-dark/70 dark:text-light/70">Max Participants</p>
                                    <p className="font-bold text-dark dark:text-light">{training.max_participants || 'Unlimited'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        {training.status && (
                            <div className="rounded-2xl border border-alpha/20 bg-light p-4 text-center dark:bg-dark">
                                <span className="rounded-full bg-alpha/10 px-4 py-2 text-sm font-bold text-alpha">
                                    {training.status.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for adding students */}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-lg border border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Add Student</DialogTitle>
                        </DialogHeader>

                        {/* Search Filter */}
                        <div className="mt-4">
                            <Input type="text" placeholder="Search by name..." value={modalFilter} onChange={(e) => setModalFilter(e.target.value)} />
                        </div>

                        <div className="mt-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {filteredAvailableUsers.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-dark/50 dark:text-light/60">No available students</div>
                                ) : (
                                    filteredAvailableUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center justify-between rounded-lg border border-alpha/20 p-3 transition-colors hover:border-alpha/40"
                                            onClick={() => router.visit(`/users/${user.id}`)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-alpha font-bold text-light">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-dark dark:text-light">{user.name}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddStudent(user);
                                                }}
                                                variant="outline"
                                                className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold"
                                            >
                                                <UserPlus size={16} />
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="mt-4 text-right">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Attendance Modal with FullCalendar */}
                <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
                    <DialogContent className="flex h-[100svh] w-full max-w-full flex-col gap-4 overflow-x-hidden overflow-y-auto rounded-none border border-alpha/20 bg-light p-4 text-dark shadow-xl sm:h-auto sm:max-w-[95vw] sm:gap-5 sm:rounded-2xl sm:p-6 md:p-8 lg:max-w-[1100px] dark:bg-dark dark:text-light">
                        {/* Header */}
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-extrabold text-dark lg:text-4xl dark:text-light">
                                Training Attendance Calendar
                            </DialogTitle>
                            <p className="text-lg text-dark/70 lg:text-xl dark:text-light/70">Click on any day to manage attendance for that date</p>
                        </DialogHeader>

                        {/* Calendar */}
                        {/* Custom calendar toolbar */}
                        <div className="flex flex-col gap-3">
                            <div className="text-center text-sm font-semibold sm:text-base md:text-lg">{calendarTitle}</div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={() => calendarApi && calendarApi.prev()} className="p-2">
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button variant="outline" onClick={() => calendarApi && calendarApi.today()} className="px-3">
                                        Today
                                    </Button>
                                    <Button variant="outline" onClick={() => calendarApi && calendarApi.next()} className="p-2">
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        className="border border-[var(--color-alpha)] bg-[var(--color-alpha)] text-black hover:bg-transparent hover:text-[var(--color-alpha)]"
                                        onClick={() => {
                                            const api =
                                                calendarApi ||
                                                (calendarRef.current && typeof calendarRef.current.getApi === 'function'
                                                    ? calendarRef.current.getApi()
                                                    : null);
                                            if (api && typeof api.changeView === 'function') {
                                                api.changeView('dayGridMonth');
                                                if (typeof api.today === 'function') {
                                                    api.today();
                                                }
                                            }
                                        }}
                                    >
                                        Month
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="overflow-x-auto overflow-y-auto rounded-xl border border-alpha/20 bg-light p-2 text-dark shadow-sm sm:p-3 md:p-4 dark:bg-dark dark:text-light"
                            style={{ height: 'calc(100svh - 260px)' }}
                        >
                            <FullCalendar
                                ref={(el) => {
                                    calendarRef.current = el;
                                    if (el && typeof el.getApi === 'function') {
                                        const api = el.getApi();
                                        if (api !== calendarApi) setCalendarApi(api);
                                    }
                                }}
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                selectable={true}
                                selectMirror={true}
                                editable={true}
                                events={events}
                                datesSet={(arg) => setCalendarTitle(arg.view.title)}
                                eventClick={(info) => {
                                    const dateStr = info?.event?.startStr || info?.event?._instance?.range?.start?.toISOString()?.slice(0, 10);
                                    if (!dateStr) return;
                                    setSelectedDate(dateStr);
                                    AddAttendance(dateStr);
                                    setShowAttendance(false);
                                    setShowAttendanceList(true);
                                }}
                                dateClick={(info) => {
                                    setSelectedDate(info.dateStr);
                                    AddAttendance(info.dateStr);
                                    setShowAttendance(false);
                                    setShowAttendanceList(true);
                                }}
                                height="100%"
                                headerToolbar={{ left: '', center: '', right: '' }}
                                dayMaxEvents={true}
                                moreLinkClick="popover"
                                eventDisplay="block"
                                eventTextColor="#000000"
                                dayCellClassNames="hover:bg-alpha/10 cursor-pointer transition-colors duration-200 rounded-md"
                                dayHeaderClassNames="bg-secondary/50 text-dark dark:text-light font-semibold text-[13px]"
                                todayClassNames="bg-alpha/20 border border-alpha/60"
                                dayCellContent={(info) => (
                                    <div className="flex h-full items-center justify-center font-semibold text-dark dark:text-light">
                                        {info.dayNumberText}
                                    </div>
                                )}
                                dayHeaderContent={(info) => <div className="text-center font-bold text-dark dark:text-light">{info.text}</div>}
                            />
                        </div>

                        {/* Legend removed to allow calendar more vertical space */}
                    </DialogContent>
                </Dialog>

                {/* Attendance List Modal */}
                <Dialog open={showAttendanceList} onOpenChange={setShowAttendanceList}>
                    <DialogContent className="h-[100svh] w-full max-w-full overflow-x-hidden overflow-y-auto rounded-none border border-alpha/20 bg-light p-4 text-dark sm:h-auto sm:max-w-[95vw] sm:rounded-2xl sm:p-5 md:p-6 lg:max-w-[1100px] dark:bg-dark dark:text-light">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-dark md:text-3xl dark:text-light">
                                Attendance for{' '}
                                {selectedDate &&
                                    new Date(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                            </DialogTitle>
                            <p className="text-sm text-dark/70 md:text-base dark:text-light/70">Mark attendance for each student</p>
                        </DialogHeader>
                        <div className="mt-4">
                            <div className="-ml-3 h-[52vh] overflow-x-hidden overflow-y-auto rounded-xl border border-alpha/20 bg-light text-dark shadow-sm md:-ml-4 dark:bg-dark dark:text-light">
                                {/* Mobile cards layout */}
                                <div className="block space-y-3 p-3 pr-4 md:hidden">
                                    {students.map((student) => {
                                        const studentKey = `${selectedDate}-${student.id}`;
                                        const currentData = attendanceData[studentKey] || {
                                            morning: 'present',
                                            lunch: 'present',
                                            evening: 'present',
                                            notes: '',
                                        };
                                        return (
                                            <div key={student.id} className="rounded-lg border border-alpha/20 p-3">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-alpha font-bold text-light">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-dark dark:text-light">{student.name}</p>
                                                        <p className="truncate text-xs text-dark/70 dark:text-light/70">{student.email}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <Select
                                                        value={currentData.morning ?? 'present'}
                                                        onValueChange={(val) => {
                                                            const newData = { ...currentData, morning: val };
                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            className={`h-10 rounded-xl border text-sm ${statusClass(currentData.morning ?? 'present') || 'border-alpha/30'}`}
                                                        >
                                                            <SelectValue placeholder="9:30 - 11:00" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="present">Present</SelectItem>
                                                            <SelectItem value="absent">Absent</SelectItem>
                                                            <SelectItem value="late">Late</SelectItem>
                                                            <SelectItem value="excused">Excused</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Select
                                                        value={currentData.lunch ?? 'present'}
                                                        onValueChange={(val) => {
                                                            const newData = { ...currentData, lunch: val };
                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            className={`h-10 rounded-xl border text-sm ${statusClass(currentData.lunch ?? 'present') || 'border-alpha/30'}`}
                                                        >
                                                            <SelectValue placeholder="11:30 - 13:00" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="present">Present</SelectItem>
                                                            <SelectItem value="absent">Absent</SelectItem>
                                                            <SelectItem value="late">Late</SelectItem>
                                                            <SelectItem value="excused">Excused</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Select
                                                        value={currentData.evening ?? 'present'}
                                                        onValueChange={(val) => {
                                                            const newData = { ...currentData, evening: val };
                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            className={`h-10 rounded-xl border text-sm ${statusClass(currentData.evening ?? 'present') || 'border-alpha/30'}`}
                                                        >
                                                            <SelectValue placeholder="14:00 - 17:00" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="present">Present</SelectItem>
                                                            <SelectItem value="absent">Absent</SelectItem>
                                                            <SelectItem value="late">Late</SelectItem>
                                                            <SelectItem value="excused">Excused</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-alpha/30 bg-light p-2 dark:bg-dark">
                                                        {Array.isArray(currentData.notes) &&
                                                            currentData.notes.map((n, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs"
                                                                >
                                                                    {n}
                                                                    <button
                                                                        type="button"
                                                                        className="text-red-500 hover:text-red-600"
                                                                        onClick={() => removeNote(studentKey, idx)}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        <div className="flex w-full items-center gap-2 sm:w-auto">
                                                            <input
                                                                type="text"
                                                                placeholder="Add note"
                                                                className="flex-1 bg-transparent text-sm outline-hidden"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addNote(studentKey, e.currentTarget.value);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="rounded-md bg-alpha/10 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-alpha/20 dark:text-white"
                                                                onClick={(e) => {
                                                                    const input = e.currentTarget.previousElementSibling;
                                                                    const val = input && 'value' in input ? input.value : '';
                                                                    addNote(studentKey, val);
                                                                    if (input && 'value' in input) input.value = '';
                                                                }}
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden md:block">
                                    <div className="overflow-x-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 z-10 bg-secondary/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-dark dark:text-light">Student</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-dark dark:text-light">9:30 - 11:00</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-dark dark:text-light">11:30 - 13:00</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-dark dark:text-light">14:00 - 17:00</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-dark dark:text-light">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-alpha/10">
                                                {students.map((student) => {
                                                    const studentKey = `${selectedDate}-${student.id}`;
                                                    const currentData = attendanceData[studentKey] || {
                                                        morning: 'present',
                                                        lunch: 'present',
                                                        evening: 'present',
                                                        notes: '',
                                                    };
                                                    return (
                                                        <tr key={student.id} className="transition-colors hover:bg-accent/30">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-alpha font-bold text-light">
                                                                        {student.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-base font-bold text-dark dark:text-light">
                                                                            {student.name}
                                                                        </p>
                                                                        <p className="text-xs text-dark/70 md:text-sm dark:text-light/70">
                                                                            {student.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="inline-block min-w-[150px]">
                                                                    <Select
                                                                        value={currentData.morning ?? 'present'}
                                                                        onValueChange={(val) => {
                                                                            const newData = { ...currentData, morning: val };
                                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger
                                                                            className={`h-10 rounded-xl border text-sm focus:ring-[var(--color-alpha)]/40 ${statusClass(currentData.morning ?? 'present') || 'border-alpha/30'}`}
                                                                        >
                                                                            <SelectValue placeholder="Morning" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="present">Present</SelectItem>
                                                                            <SelectItem value="absent">Absent</SelectItem>
                                                                            <SelectItem value="late">Late</SelectItem>
                                                                            <SelectItem value="excused">Excused</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="inline-block min-w-[150px]">
                                                                    <Select
                                                                        value={currentData.lunch ?? 'present'}
                                                                        onValueChange={(val) => {
                                                                            const newData = { ...currentData, lunch: val };
                                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger
                                                                            className={`h-10 rounded-xl border text-sm focus:ring-[var(--color-alpha)]/40 ${statusClass(currentData.lunch ?? 'present') || 'border-alpha/30'}`}
                                                                        >
                                                                            <SelectValue placeholder="11:30 - 13:00" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="present">Present</SelectItem>
                                                                            <SelectItem value="absent">Absent</SelectItem>
                                                                            <SelectItem value="late">Late</SelectItem>
                                                                            <SelectItem value="excused">Excused</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="inline-block min-w-[150px]">
                                                                    <Select
                                                                        value={currentData.evening ?? 'present'}
                                                                        onValueChange={(val) => {
                                                                            const newData = { ...currentData, evening: val };
                                                                            setAttendanceData((prev) => ({ ...prev, [studentKey]: newData }));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger
                                                                            className={`h-10 rounded-xl border text-sm focus:ring-[var(--color-alpha)]/40 ${statusClass(currentData.evening ?? 'present') || 'border-alpha/30'}`}
                                                                        >
                                                                            <SelectValue placeholder="14:00 - 17:00" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="present">Present</SelectItem>
                                                                            <SelectItem value="absent">Absent</SelectItem>
                                                                            <SelectItem value="late">Late</SelectItem>
                                                                            <SelectItem value="excused">Excused</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-alpha/30 bg-light px-2 py-2 text-sm dark:bg-dark">
                                                                    {Array.isArray(currentData.notes) &&
                                                                        currentData.notes.map((n, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs"
                                                                            >
                                                                                {n}
                                                                                <button
                                                                                    type="button"
                                                                                    className="text-red-500 hover:text-red-600"
                                                                                    onClick={() => removeNote(studentKey, idx)}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Add note"
                                                                        className="flex-1 bg-transparent outline-hidden"
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                addNote(studentKey, e.currentTarget.value);
                                                                                e.currentTarget.value = '';
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-alpha/20 bg-light py-3 pr-3 sm:flex-row sm:items-center sm:justify-between md:pr-6 dark:bg-dark">
                            <div className="text-sm text-dark/70 md:text-base dark:text-light/70">
                                Total Students: <span className="text-xl font-bold">{students.length}</span>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-0 sm:space-x-4">
                                <Button variant="outline" onClick={() => setShowAttendanceList(false)} className="w-full px-6 py-2 sm:w-auto">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        // Save attendance logic here
                                        handleSave();
                                    }}
                                    className="w-full border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-6 py-2 text-black hover:bg-transparent hover:text-[var(--color-alpha)] sm:w-auto"
                                >
                                    Save Attendance
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <GeekyWheel
                    setShowWinnerModal={setShowWinnerModal}
                    showGeekyWheel={showGeekyWheel}
                    setShowGeekyWheel={setShowGeekyWheel}
                    wheelParticipants={wheelParticipants}
                    isSpinning={isSpinning}
                    selectedWinner={selectedWinner}
                    continueSpinning={continueSpinning}
                    resetWheel={resetWheel}
                    removeWinner={removeWinner}
                    showWinnerModal={showWinnerModal}
                    spinWheel={spinWheel}
                    wheelRotation={wheelRotation}
                />
                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent className="max-w-md border border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
                        <DialogHeader>
                            <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <p className="text-dark/70 dark:text-light/70">
                                Are you sure you want to remove <strong>{studentToDelete?.name}</strong> from this training?
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button className="bg-red-500 text-white hover:bg-red-600" onClick={confirmDelete}>
                                Remove Student
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
