import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import React, { useState } from 'react'
import CreatTraining from './partials/CreatTraining'
import { Timer, User } from 'lucide-react'

export default function Training({ trainings, coaches, filters = {}, tracks = [] }) {
  const [selectedCoach, setSelectedCoach] = useState(filters.coach || '');
  const [selectedTrack, setSelectedTrack] = useState(filters.track || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCoach) params.set('coach', selectedCoach);
    if (selectedTrack) params.set('track', selectedTrack);
    router.visit(`/training?${params.toString()}`);
  };
  return (
    <AppLayout>
      <Head title="Training" />

      <div className="p-6 min-h-screen">
        {/* Header with Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-dark dark:bg-light bg-clip-text text-transparent">
              Training Programs
            </h1>
            <p className="text-dark/70 mt-2 dark:text-light/70">Discover amazing coding and media courses</p>
          </div>
          <CreatTraining coaches={coaches} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-dark/70 dark:text-light/70 mb-1">Coach</label>
            <select value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)} className="border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark">
              <option value="">All</option>
              {coaches.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-dark/70 dark:text-light/70 mb-1">Track</label>
            <select value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)} className="border border-alpha/30 rounded-lg px-3 py-2 bg-light dark:bg-dark">
              <option value="">All</option>
              {tracks.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <button onClick={applyFilters} className="px-4 py-2 rounded-lg border border-alpha/30 hover:bg-alpha/10">Apply</button>
        </div>
        <div className='mb-8'>
          {/* Modern Stats Cards */}
          {trainings && trainings.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 text-center border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-black text-yellow-600 mb-2">
                  {trainings.length}
                </div>
                <div className="text-yellow-700 font-bold text-lg">
                  Total Programs
                </div>

              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 text-center border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-black text-yellow-600 mb-2">
                  {trainings.filter(t => t.status === 'active').length}
                </div>
                <div className="text-yellow-700 font-bold text-lg">
                  Active Now
                </div>

              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 text-center border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-black text-yellow-600 mb-2">
                  {coaches.length}
                </div>
                <div className="text-yellow-700 font-bold text-lg">
                  Expert Mentors
                </div>

              </div>
            </div>
          )}
        </div>
        {/* Training Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {trainings && trainings.length > 0 ? (
            trainings.map((training) => (
              <div
                key={training.id}
                className="bg-light dark:bg-dark rounded-xl border border-alpha/20 hover:border-alpha/40 transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => router.visit(`/trainings/${training.id}`)}
              >
                {/* Training Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={
                      training.category?.toLowerCase() === "coding"
                        ? "/assets/images/training/coding.jpg"
                        : training.category?.toLowerCase() === "media"
                          ? "/assets/images/training/media.jpg"
                          : training.img || "/assets/images/training/default.jpg"
                    }
                    alt={training.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Badge */}
                  {training.status && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        training.status === 'active'
                          ? 'bg-green-500/90 text-white'
                          : training.status === 'upcoming'
                            ? 'bg-blue-500/90 text-white'
                            : 'bg-gray-500/90 text-white'
                      }`}>
                        {training.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Category & Name */}
                  <div>
                    <span className="text-xs font-medium text-alpha uppercase tracking-wide">
                      {training.category}
                    </span>
                    <h3 className="text-lg font-semibold text-dark dark:text-light mt-1 line-clamp-2">
                      {training.name}
                    </h3>
                  </div>

                  {/* Description */}
                  {training.description && (
                    <p className="text-sm text-dark/70 dark:text-light/70 line-clamp-2">
                      {training.description}
                    </p>
                  )}

                  {/* Coach */}
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-alpha flex items-center justify-center text-light text-xs font-bold">
                      {training.coach ? training.coach.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}
                    </div>
                    <span className="text-sm text-dark/70 dark:text-light/70">
                      {training.coach?.name || 'Expert Instructor'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-dark/70 dark:text-light/70">
                      <Timer size={14} />
                      <span>{training.start_time || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-dark/70 dark:text-light/70">
                      <User size={14} />
                      <span>{training.users_count ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Modern Empty State */
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Ready to Create Something Amazing?
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                Start your journey by adding your first coding or media training program.

              </p>
              <CreatTraining coaches={coaches} />
            </div>
          )}
        </div>


      </div>
    </AppLayout>
  )
}

