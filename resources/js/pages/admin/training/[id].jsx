import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarCheck, Play, ChevronDown } from 'lucide-react';
import { Users, CalendarDays, User, Trash2, Plus, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

      <div className="p-6 min-h-screen bg-light dark:bg-dark">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-dark dark:text-light">{training.name}</h1>
            <p className="text-dark/70 mt-2 dark:text-light/70">{training.category}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 border border-alpha/30 text-dark dark:text-light px-4 py-2 rounded-lg hover:bg-alpha/10"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => setShowAttendance(true)}
            className="flex items-center space-x-2 border border-alpha/30 text-dark dark:text-light px-4 py-2 rounded-lg hover:bg-alpha/10"
          >
            <CalendarCheck size={16} />
            <span>Attendance</span>
          </button>

            {/* Play Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPlayDropdown(!showPlayDropdown)}
                className="flex items-center space-x-2 border border-alpha/30 text-dark dark:text-light px-4 py-2 rounded-lg hover:bg-alpha/10 transition-all duration-300"
              >
                <Play size={16} />
                <span className="hidden sm:inline">Play</span>
                <ChevronDown size={16} className={`transform transition-transform duration-300 ${showPlayDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showPlayDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-light dark:bg-dark border border-alpha/20 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={openGeekyWheel}
                    className="w-full text-left px-4 py-3 hover:bg-alpha/10 rounded-t-xl transition-colors text-dark dark:text-light font-semibold"
                  >
                    Geeky Wheel
                  </button>
                  <button
                    onClick={() => {
                      setShowPlayDropdown(false);
                      router.visit(`/training/${training.id}/geeko`);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-alpha/10 rounded-b-xl transition-colors text-dark dark:text-light font-semibold"
                  >
                    Geeko
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-72 rounded-2xl overflow-hidden border border-alpha/20 mb-8">
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
              <div className="bg-light dark:bg-dark rounded-2xl border border-alpha/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                  Enrolled Students ({students.length})
                </h2>
                </div>

                {/* Filter Input */}
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="mb-6 w-full border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark"
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
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="border border-alpha/30 text-dark dark:text-light p-2 rounded-lg hover:bg-alpha/10"
                      >
                        <Trash2 size={16} />
                      </button>
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
          <DialogContent className="max-w-lg bg-light dark:bg-dark border border-alpha/20">
    <DialogHeader>
      <DialogTitle className="text-2xl">Add Student</DialogTitle>
    </DialogHeader>

            {/* Search Filter */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={modalFilter}
                onChange={e => setModalFilter(e.target.value)}
                className="w-full border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark"
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
                  <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddStudent(user);
                        }}
                        className="inline-flex items-center gap-2 border border-alpha/30 hover:bg-alpha/10 text-dark dark:text-light px-3 py-1 rounded-lg font-semibold transition text-sm"
                      >
                        <UserPlus size={16} />
                    Add
                  </button>
                    </div>
            ))
          )}
              </div>
    </div>
    <div className="mt-4 text-right">
      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-alpha/30 hover:bg-alpha/10">Close</button>
    </div>
  </DialogContent>
</Dialog>

        {/* Attendance Modal with FullCalendar */}
<Dialog open={showAttendance} onOpenChange={setShowAttendance}>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-[1200px] bg-light dark:bg-dark border border-alpha/20 flex flex-col gap-6 p-8 rounded-3xl shadow-2xl">

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
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl border border-alpha/20 p-4 shadow-xl overflow-y-auto "
              style={{ height: 'calc(100vh - 350px)' }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                selectMirror={true}
                editable={true}
                events={events}
                eventClick={(info) => alert(`Event: ${info.event.title}`)}
                dateClick={(info) => {
                  setSelectedDate(info.dateStr);
                  AddAttendance(info.dateStr);
                  setShowAttendance(false);
                  setShowAttendanceList(true);
                }}

                height="100%"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth",
                }}
                dayMaxEvents={true}
                moreLinkClick="popover"
                eventDisplay="block"
                dayCellClassNames="hover:bg-alpha/20 cursor-pointer transition-all duration-300 rounded-lg"
                dayHeaderClassNames="bg-alpha/20 text-dark dark:text-light font-bold text-sm"
                todayClassNames="bg-alpha/30 border-2 border-alpha"
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
              <button
                onClick={() => setShowAttendance(false)}
                className="px-10 py-3 rounded-xl border border-alpha/30 hover:bg-alpha/10 font-bold text-lg lg:text-xl transition-all duration-300 hover:scale-105 hover:opacity-80"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance List Modal */}
        <Dialog open={showAttendanceList} onOpenChange={setShowAttendanceList}>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-[1200px]    bg-light dark:bg-dark border border-alpha/20">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-dark dark:text-light">
                Attendance for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogTitle>
              <p className="text-dark/70 dark:text-light/70 text-lg">Mark attendance for each student</p>
            </DialogHeader>
            <div className="mt-8 ">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-alpha/20 h-[50vh] overflow-y-scroll shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full ">
                    <thead className="bg-alpha/20">
                      <tr>
                        <th className="px-8 py-6 text-left text-lg font-bold text-dark dark:text-light">Student</th>
                        <th className="px-8 py-6 text-center text-lg font-bold text-dark dark:text-light">9:30 - 11:00</th>
                        <th className="px-8 py-6 text-center text-lg font-bold text-dark dark:text-light">11:30 - 13:00</th>
                        <th className="px-8 py-6 text-center text-lg font-bold text-dark dark:text-light">14:00 - 17:00</th>
                        <th className="px-8 py-6 text-center text-lg font-bold text-dark dark:text-light">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-alpha/20 ">
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
                          <tr key={student.id} className="hover:bg-alpha/10 transition-all duration-300">
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-alpha text-light flex items-center justify-center font-bold text-lg">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-dark dark:text-light">{student.name}</p>
                                  <p className="text-sm text-dark/70 dark:text-light/70">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select
                                className="border border-alpha/30 rounded-xl px-4 py-3 bg-light dark:bg-dark text-lg font-semibold min-w-[120px]"
                                value={currentData.morning}
                                onChange={(e) => {
                                  const newData = { ...currentData, morning: e.target.value };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                              </select>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select
                                className="border border-alpha/30 rounded-xl px-4 py-3 bg-light dark:bg-dark text-lg font-semibold min-w-[120px]"
                                value={currentData.l}
                                onChange={(e) => {
                                  const newData = { ...currentData, lunch: e.target.value };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                              </select>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select
                                className="border border-alpha/30 rounded-xl px-4 py-3 bg-light dark:bg-dark text-lg font-semibold min-w-[120px]"
                                value={currentData.evening}
                                onChange={(e) => {
                                  const newData = { ...currentData, evening: e.target.value };
                                  setAttendanceData(prev => ({ ...prev, [studentKey]: newData }));
                                }}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                              </select>
                            </td>

                            <td className="px-8 py-6 text-center">
                              <input
                                type="text"
                                placeholder="Optional notes..."
                                className="border border-alpha/30 rounded-xl px-4 py-3 bg-light dark:bg-dark text-lg font-semibold w-full min-w-[200px]"
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

            <div className=" mt-8 flex justify-between items-center">
              <div className="text-lg text-dark/70 dark:text-light/70">
                Total Students: <span className="font-bold text-xl">{students.length}</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAttendanceList(false)}
                  className="px-8 py-3 rounded-xl border border-alpha/30 hover:bg-alpha/10 font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save attendance logic here
                    handleSave();
                    setShowAttendanceList(false);
                  }}
                  className="px-8 py-3 rounded-xl bg-alpha text-light hover:bg-alpha/90 font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Save Attendance
                </button>
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
          <DialogContent className="max-w-md bg-light dark:bg-dark border border-alpha/20">
            <DialogHeader>
              <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-dark/70 dark:text-light/70">
                Are you sure you want to remove <strong>{studentToDelete?.name}</strong> from this training?
              </p>
    </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-alpha/30 hover:bg-alpha/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove Student
              </button>
    </div>
  </DialogContent>
</Dialog>

      </div>
    </AppLayout>
  );
}
