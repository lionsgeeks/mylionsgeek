import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Users, CalendarDays, User, Trash2, Plus, UserPlus } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';

export default function Show({ training, usersNull }) {
  const [students, setStudents] = useState(training.users || []);
  const [availableUsers, setAvailableUsers] = useState(usersNull || []);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter enrolled students
  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Delete student
  

  // Add student from modal
  

  return (
    <AppLayout>
      <Head title={training.name} />

      <div className="p-6 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{training.name}</h1>
            <p className="text-gray-600 mt-2">{training.category}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>

        {/* Hero Image */}
        <div className="w-full h-72 rounded-2xl overflow-hidden shadow-lg mb-8">
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
            <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
              {training.name}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side – Students List */}
          <div className="lg:col-span-2 space-y-6">
            {students.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Enrolled Students ({students.length})
                </h2>

                {/* Filter Input */}
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="mb-4 w-full border border-gray-300 rounded-lg px-3 py-2"
                />

                <ul className="space-y-3">
                  {filteredStudents.map(user => (
                    <li key={user.id} className="flex items-center justify-between space-x-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
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
            <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">
                {training.coach
                  ? training.coach.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : 'C'}
              </div>
              <div>
                <p className="font-bold text-gray-800">{training.coach?.name || 'Expert Instructor'}</p>
                <p className="text-sm text-gray-500">{training.coach?.speciality || 'Professional Mentor'}</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarDays className="text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="font-bold text-gray-800">{training.start_time || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Enrolled Students</p>
                  <p className="font-bold text-gray-800">{students.length}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Max Participants</p>
                  <p className="font-bold text-gray-800">{training.max_participants || 'Unlimited'}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            {training.status && (
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    training.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : training.status === 'upcoming'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {training.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal for adding students */}
       
<Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
  {/* Overlay */}
  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

  {/* Modal */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
      
      <Dialog.Title className="text-2xl font-bold text-gray-800">Add Student</Dialog.Title>

      {/* Table */}
      <div className="mt-6 max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {availableUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No available students
                </td>
              </tr>
            ) : (
              availableUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleAddStudent(user)}
                      className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      <UserPlus size={18} />
                      Add
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Close Button */}
      <div className="mt-6 text-right">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
        >
          Close
        </button>
      </div>

    </Dialog.Panel>
  </div>
</Dialog>

      </div>
    </AppLayout>
  );
}
