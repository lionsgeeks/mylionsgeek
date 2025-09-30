import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import React from 'react'
import CreatTraining from './partials/CreatTraining'
import { Timer, User } from 'lucide-react'

export default function Training({ trainings, coaches }) {
  return (
    <AppLayout>
      <Head title="Training" />

      <div className="p-6  min-h-screen">
        {/* Header with Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-black dark:bg-white bg-clip-text text-transparent">
              Training Programs
            </h1>
            <p className="text-gray-600 mt-2 dark:text-gray-300">Discover amazing coding and media courses</p>
          </div>
          <CreatTraining coaches={coaches} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {trainings && trainings.length > 0 ? (
            trainings.map((training) => (
              <div
                key={training.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden group border border-gray-100"
              >
                {/* Training Image with Modern Overlay */}
             <div className="relative h-52 overflow-hidden group">
  {/* Image: category-based or default from DB */}
  <img
    src={
       training.category?.toLowerCase() === "coding"
        ? "/assets/images/training/coding.jpg"
        : training.category?.toLowerCase() === "media"
        ? "/assets/images/training/media.jpg"
        : "/assets/images/training/default.jpg"
        ?training.img
        : training.img
        
    }
    alt={training.name}
    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
  />

  {/* Modern Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

  {/* Floating Action on Hover */}
  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
    <button
      onClick={() => router.visit(`/trainings/${training.id}`)}
      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
    >
      Explore Course
    </button>
  </div>
</div>



                {/* Card Content with Modern Styling */}
                <div className="p-6">
                  {/* Category Badge */}
                
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      training.category?.toLowerCase().includes('coding') ? 'bg-yellow-100 text-yellow-800' :
                      training.category?.toLowerCase().includes('media') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {training.category}
                    </span>
                  </div>

                  {/* Training Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-yellow-600 group-hover:bg-clip-text transition-all duration-300">
                    {training.name}
                  </h3>

                  {/* Training Description */}
                  {training.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {training.description}
                    </p>
                  )}

                  {/* Coach Information with Modern Design */}
                  <div className="flex items-center space-x-3 mb-5 p-3 bg-gray-50 rounded-xl">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {
  training.coach ? 
    training.coach.name
      .split(' ')            
      .map(n => n[0])        
      .join('.')              
      .toUpperCase()          
    : 'C'
}

                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        {training.coach ? training.coach.name : 'Expert Instructor'}
                      </p>
                      {/* <p className="text-xs text-gray-500 font-medium">
                        {training.coach?.speciality || 'Professional Mentor'}
                      </p> */}
                    </div>
                  </div>

                  {/* Training Details with Icons */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center space-x-2 bg-yellow-50 p-2 rounded-lg">
                      <span className="text-yellow-600 text-lg"><Timer /></span>
                      <div>
                        <p className="text-xs text-yellow-600 font-medium">Start Time</p>
                        <p className="text-sm font-bold text-yellow-800">
                          {training.start_time || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-50 p-2 rounded-lg">
                      <span className="text-yellow-600 text-lg"><User /></span>
                      <div>
                        <p className="text-xs text-yellow-600 font-medium">Students</p>
                        <p className="text-sm font-bold text-yellow-800">
  {training.users_count ?? 0}
</p>

                      </div>
                    </div>
                  </div>

                  
                </div>

                {/* Status Badge with Glow Effect */}
                {training.status && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      training.status === 'active' 
                        ? 'bg-yellow-500 text-white shadow-yellow-500/50' 
                        : training.status === 'upcoming'
                        ? 'bg-amber-500 text-white shadow-amber-500/50'
                        : 'bg-gray-500 text-white shadow-gray-500/50'
                    }`}>
                      {training.status?.toUpperCase()}
                    </span>
                  </div>
                )}
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
