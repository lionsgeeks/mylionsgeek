import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarCheck, Play, ChevronDown } from 'lucide-react';
import { Users, CalendarDays, User, Trash2, Plus, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
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
  const [events] = useState([
    // placeholder events; wire real data later
    // { date: '2025-10-05', title: 'Session', type: 'session' }
  ]);
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

  //   attendance


  function AddAttendance(dateStr) {
    axios.post("/attendances", {
      formation_id: training.id,
      attendance_day: dateStr,
    })
      .then(res => {
        // juste save ID f state
        setCurrentAttendanceId(res.data.attendance_id);
        setShowAttendanceList(true);
      })
      .catch(err => console.error(err));
  }


  //   atteandacelist
  function handleSave() {
    const dataToSave = Object.entries(attendanceData).map(([key, value]) => {
      const studentId = key.split('-')[1];
      return {
        user_id: studentId,
        attendance_day: selectedDate,
        attendance_id: currentAttendanceId,
        morning: value.morning,
        lunch: value.lunch,
        evening: value.evening,
        note: value.notes || null,
      };
    });

    router.post('/admin/attendance/save', { attendance: dataToSave });
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
      setWheelParticipants(prev => prev.filter(p => p.id !== selectedWinner.id));
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
  // Filter enrolled students
  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Filter available users to exclude admins, coaches, and already assigned students
  const filteredAvailableUsers = availableUsers.filter(user => {
    // Exclude admins (assuming role field exists)
    if (user.role === 'admin') return false;

    // Exclude coaches (assuming role field exists)
    if (user.role === 'coach') return false;

    // Exclude users already assigned to this training
    const isAlreadyAssigned = students.some(student => student.id === user.id);
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
    router.post(`/trainings/${training.id}/students`, { student_id: user.id }, {
      onSuccess: () => {
        setStudents(prev => [...prev, user]);
        setAvailableUsers(prev => prev.filter(u => u.id !== user.id));
      }
    });
  };
  const handleDelete = (userId) => {
    const student = students.find(s => s.id === userId);
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      router.delete(`/trainings/${training.id}/students/${studentToDelete.id}`, {
        onSuccess: () => {
          setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
          setAvailableUsers(prev => [...prev, studentToDelete]);
          setShowDeleteConfirm(false);
          setStudentToDelete(null);
        }
      });
    }
  };


  return (
    <AppLayout>
      <Head title={training.name} />

      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-light leading-tight break-words">
              {training.name}
            </h1>
            <p className="text-dark/70 mt-1 sm:mt-2 dark:text-light/70">{training.category}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] flex-1 sm:flex-none"
            >
              <Plus size={16} />
              <span>Add Student</span>
            </Button>
            <Button
              onClick={() => setShowAttendance(true)}
              className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] flex-1 sm:flex-none"
            >
              <CalendarCheck size={16} />
              <span>Attendance</span>
            </Button>

            {/* Play Dropdown */}
            <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
              <Button
                onClick={() => setShowPlayDropdown(!showPlayDropdown)}
                className="gap-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] transition-all duration-300 w-full sm:w-auto"
              >
                <Play size={16} />
                <span className="hidden sm:inline">Play</span>
                <ChevronDown size={16} className={`transform transition-transform duration-300 ${showPlayDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {showPlayDropdown && (
                <div className="absolute right-0 mt-2 w-full sm:w-48 bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={openGeekyWheel}
                    className="w-full text-left px-4 py-3 hover:bg-alpha/10 rounded-t-xl transition-colors text-dark dark:text-light font-semibold"
                  >
                    Geeky Wheel
                  </button>
                  <button
                    onClick={() => {
                      setShowPlayDropdown(false);
                      // Add The Geek functionality later
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-alpha/10 rounded-b-xl transition-colors text-dark dark:text-light font-semibold"
                  >
                    The Geek
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-64 rounded-2xl overflow-hidden border border-alpha/20 mb-8">
          {training.img ? (
            <img
              src={
                training.category?.toLowerCase() === 'coding'
                  ? '/assets/images/training/coding.jpg'
                  : training.category?.toLowerCase() === 'media'
                    ? '/assets/images/training/media.jpg'
                    : training.img
              }
              alt={training.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-alpha to-alpha/70 flex items-center justify-center text-light font-bold text-xl">
              {training.name}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side – Students List */}
          <div className="lg:col-span-2 space-y-6">
            {students.length > 0 && (
              <div className="bg-light text-dark dark:bg-dark dark:text-light rounded-2xl border border-alpha/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    Enrolled Students ({students.length})
                  </h2>
                </div>

                {/* Filter Input */}
                <Input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="mb-6"
                />

                <ul className="space-y-3">
                  {filteredStudents.map(user => (
                    <li key={user.id} className="flex items-center justify-between space-x-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer hover:bg-alpha/5 p-2 rounded-lg transition-colors flex-1"
                        onClick={() => router.visit(`/admin/users/${user.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-alpha text-light flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-dark dark:text-light">{user.name}</p>
                          <p className="text-sm text-dark/70 dark:text-light/70">{user.email}</p>
                          <button
                            className="mt-1 inline-block text-red-600 hover:text-red-700 text-xs md:hidden"
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
                        className="hidden md:inline-flex gap-1 px-3 py-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
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
            <div className="bg-light dark:bg-dark rounded-2xl border border-alpha/20 p-6 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-alpha flex items-center justify-center text-light font-bold text-lg">
                {training.coach
                  ? training.coach.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : 'C'}
              </div>
              <div>
                <p className="font-bold text-dark dark:text-light">{training.coach?.name || 'Expert Instructor'}</p>
                <p className="text-sm text-dark/70 dark:text-light/70">{training.coach?.speciality || 'Professional Mentor'}</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-light dark:bg-dark rounded-2xl border border-alpha/20 p-6 space-y-4">
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
              <div className="bg-light dark:bg-dark rounded-2xl border border-alpha/20 p-4 text-center">
                <span className="px-4 py-2 rounded-full text-sm font-bold bg-alpha/10 text-alpha">
                  {training.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal for adding students */}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Student</DialogTitle>
            </DialogHeader>

            {/* Search Filter */}
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Search by name..."
                value={modalFilter}
                onChange={e => setModalFilter(e.target.value)}
              />
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredAvailableUsers.length === 0 ? (
                  <div className="px-4 py-6 text-center text-dark/50 dark:text-light/60">
                    No available students
                  </div>
                ) : (
                  filteredAvailableUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-alpha/20 rounded-lg hover:border-alpha/40 transition-colors cursor-pointer"
                      onClick={() => router.visit(`/users/${user.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-alpha text-light flex items-center justify-center font-bold">
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
                        className="inline-flex items-center gap-2 px-3 py-1 font-semibold text-sm"
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
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Modal with FullCalendar */}
        <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
          <DialogContent className="w-full max-w-full sm:max-w-[95vw] lg:max-w-[1100px] h-[100svh] sm:h-auto overflow-y-auto overflow-x-hidden bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 md:p-8 rounded-none sm:rounded-2xl shadow-xl">

            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-3xl lg:text-4xl font-extrabold text-dark dark:text-light">
                Training Attendance Calendar
              </DialogTitle>
              <p className="text-dark/70 dark:text-light/70 text-lg lg:text-xl">
                Click on any day to manage attendance for that date
              </p>
            </DialogHeader>

            {/* Calendar */}
            {/* Custom calendar toolbar */}
            <div className="flex flex-col gap-3">
              <div className="text-center text-sm sm:text-base md:text-lg font-semibold">{calendarTitle}</div>
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
                    className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)]"
                    onClick={() => {
                      const api = calendarApi || (calendarRef.current && typeof calendarRef.current.getApi === 'function' ? calendarRef.current.getApi() : null);
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
              className="bg-light text-dark dark:bg-dark dark:text-light rounded-xl border border-alpha/20 p-3 md:p-4 shadow-sm overflow-y-auto overflow-x-hidden"
              style={{ height: 'calc(100svh - 360px)' }}
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
                eventClick={(info) => alert(`Event: ${info.event.title}`)}
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
                dayCellClassNames="hover:bg-alpha/10 cursor-pointer transition-colors duration-200 rounded-md"
                dayHeaderClassNames="bg-secondary/50 text-dark dark:text-light font-semibold text-[13px]"
                todayClassNames="bg-alpha/20 border border-alpha/60"
                dayCellContent={(info) => (
                  <div className="flex items-center justify-center h-full font-semibold text-dark dark:text-light">
                    {info.dayNumberText}
                  </div>
                )}
                dayHeaderContent={(info) => (
                  <div className="text-center font-bold text-dark dark:text-light">
                    {info.text}
                  </div>
                )}
              />
            </div>

            {/* Legend & Close Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm lg:text-base text-dark/70 dark:text-light/70">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                  <span className="font-semibold">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
                  <span className="font-semibold">Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full"></span>
                  <span className="font-semibold">Late</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full"></span>
                  <span className="font-semibold">Excused</span>
                </div>
              </div>
              {/* Close button removed per request; use the top-right X */}
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance List Modal */}
        <Dialog open={showAttendanceList} onOpenChange={setShowAttendanceList}>
          <DialogContent className="w-full max-w-full sm:max-w-[95vw] lg:max-w-[1100px] h-[100svh] sm:h-auto overflow-y-auto overflow-x-hidden bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20 p-4 sm:p-5 md:p-6 rounded-none sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-extrabold text-dark dark:text-light">
                Attendance for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogTitle>
              <p className="text-dark/70 dark:text-light/70 text-sm md:text-base">Mark attendance for each student</p>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-light text-dark dark:bg-dark dark:text-light rounded-xl border border-alpha/20 h-[52vh] overflow-y-auto overflow-x-hidden shadow-sm ml-0">
                {/* Mobile cards layout */}
                <div className="block md:hidden p-3 pr-4 space-y-3">
                  {students.map((student) => {
                    const studentKey = `${selectedDate}-${student.id}`;
                    const currentData = attendanceData[studentKey] || {
                      status: 'present',
                      time: '09:00',
                      notes: '',
                      slot930: false,
                      slot1130: false,
                      slot1400: false,
                    };
                    return (
                      <div key={student.id} className="rounded-lg border border-alpha/20 p-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-alpha text-light flex items-center justify-center font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-dark dark:text-light truncate">{student.name}</p>
                            <p className="text-xs text-dark/70 dark:text-light/70 truncate">{student.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Select
                            value={currentData.morning}
                            onValueChange={(val) => {
                              const newData = { ...currentData, morning: val };
                              setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                            }}
                          >
                            <SelectTrigger className="h-10 rounded-xl border-alpha/30 text-sm">
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
                            value={currentData.lunch}
                            onValueChange={(val) => {
                              const newData = { ...currentData, lunch: val };
                              setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                            }}
                          >
                            <SelectTrigger className="h-10 rounded-xl border-alpha/30 text-sm">
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
                            value={currentData.evening}
                            onValueChange={(val) => {
                              const newData = { ...currentData, evening: val };
                              setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                            }}
                          >
                            <SelectTrigger className="h-10 rounded-xl border-alpha/30 text-sm">
                              <SelectValue placeholder="14:00 - 17:00" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="text"
                            placeholder="Optional notes..."
                            value={currentData.notes}
                            onChange={(e) => {
                              const newData = { ...currentData, notes: e.target.value };
                              setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block">
                <div className="overflow-x-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 sticky top-0 z-10">
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
                          status: 'present',
                          time: '09:00',
                          notes: '',
                          slot930: false,
                          slot1130: false,
                          slot1400: false,
                        };
                        return (
                          <tr key={student.id} className="hover:bg-accent/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-alpha text-light flex items-center justify-center font-bold">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-base text-dark dark:text-light">{student.name}</p>
                                  <p className="text-xs md:text-sm text-dark/70 dark:text-light/70">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-block min-w-[150px]">
                                <Select
                                value={currentData.morning}
                                  onValueChange={(val) => {
                                    const newData = { ...currentData, morning: val };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                  <SelectTrigger className="h-10 rounded-xl border-alpha/30 focus:ring-[var(--color-alpha)]/40 text-sm">
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
                                  value={currentData.lunch}
                                  onValueChange={(val) => {
                                    const newData = { ...currentData, lunch: val };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                  <SelectTrigger className="h-10 rounded-xl border-alpha/30 focus:ring-[var(--color-alpha)]/40 text-sm">
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
                                value={currentData.evening}
                                  onValueChange={(val) => {
                                    const newData = { ...currentData, evening: val };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                  <SelectTrigger className="h-10 rounded-xl border-alpha/30 focus:ring-[var(--color-alpha)]/40 text-sm">
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
                              <input
                                type="text"
                                placeholder="Optional notes..."
                                className="border border-alpha/30 rounded-xl px-3 py-2 bg-light dark:bg-dark text-sm w-full min-w-[180px]"
                                value={currentData.notes}
                                onChange={(e) => {
                                  const newData = { ...currentData, notes: e.target.value };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              />
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

            <div className="sticky bottom-0 bg-light dark:bg-dark border-t border-alpha/20 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pr-3 md:pr-6 py-3">
              <div className="text-sm md:text-base text-dark/70 dark:text-light/70">
                Total Students: <span className="font-bold text-xl">{students.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setShowAttendanceList(false)}
                  className="px-6 py-2 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Save attendance logic here
                    handleSave();
                    setShowAttendanceList(false);
                  }}
                  className="px-6 py-2 bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] w-full sm:w-auto"
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
          <DialogContent className="max-w-md bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
            <DialogHeader>
              <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-dark/70 dark:text-light/70">
                Are you sure you want to remove <strong>{studentToDelete?.name}</strong> from this training?
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Remove Student</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
