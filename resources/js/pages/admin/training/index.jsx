import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Timer, User ,Trash2 ,Edit3, BookOpen, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import CreatTraining from './partials/CreatTraining';
import UpdateTraining from './partials/UpdateTraining';

export default function Training({ trainings, coaches, filters = {}, tracks = [],promos=[]}) {
    const [selectedCoach, setSelectedCoach] = useState(filters.coach || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track || '');
    const [selectedPromo, setSelectedPromo] = useState(filters.promo || '');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [trainingToDelete, setTrainingToDelete] = useState(null);

    const openDeleteModal = (training) => {
        setTrainingToDelete(training);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setTrainingToDelete(null);
        setDeleteModalOpen(false);
    };

    const confirmDelete = () => {
        if (trainingToDelete) {
            router.delete(`/trainings/${trainingToDelete.id}`, {
                onSuccess: () => closeDeleteModal()
            });
        }
    };

    const applyFilters = (trackValue = selectedTrack, coachValue = selectedCoach , promoValue = selectedPromo) => {
        const params = new URLSearchParams();
        if (coachValue) params.set('coach', coachValue);
        if (trackValue) params.set('track', trackValue);
        if (promoValue) params.set('promo', promoValue);
        
        
        router.visit(`/training?${params.toString()}`);
    };
    const handleCoachChange = (e) => {
        const value = e.target.value;
        setSelectedCoach(value);
        applyFilters(selectedTrack, value);
    };
    const handlePromoChange = (e) => {
    const value = e.target.value;
    setSelectedPromo(value);
    applyFilters(selectedTrack, selectedCoach, value);
};


    const handleTrackChange = (e) => {
        const value = e.target.value;
        setSelectedTrack(value);
        applyFilters(value, selectedCoach);
    };

    return (
        <AppLayout>
            <Head title="Training" />

            <div className="min-h-screen p-6">
                {/* Header with Button */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="bg-dark bg-clip-text text-4xl font-extrabold text-transparent dark:bg-light">Training Programs</h1>
                        <p className="mt-2 text-dark/70 dark:text-light/70">Discover amazing coding and media courses</p>
                    </div>
                    <CreatTraining coaches={coaches} />
                </div>

                {/* Filters */}
                <div className="mb-10 rounded-2xl border border-yellow-200 p-6 shadow-sm backdrop-blur-md transition-all duration-300 dark:bg-gray-950/50">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                        {/* Coach */}
                        <div>
                            <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-white">
                                <User size={16} /> Coach
                            </label>
                            <select
                                value={selectedCoach}
                                onChange={handleCoachChange}
                                className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-gray-800 transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:ring-yellow-600"
                            >
                                <option value="">All Coaches</option>
                                {coaches.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Track */}
                        <div>
                            <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-white">
                                <BookOpen size={16} /> Track
                            </label>
                            <select
                                value={selectedTrack}
                                onChange={handleTrackChange}
                                className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-gray-800 transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:ring-yellow-600"
                            >
                                <option value="">All Tracks</option>
                                {tracks
                                    .filter((t) => t)
                                    .map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Promo */}
                        <div>
                            <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-white">
                                <TrendingUp size={16} /> Promo
                            </label>
                            <select
                                value={selectedPromo}
                                onChange={handlePromoChange}
                                className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-gray-800 transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:ring-yellow-600"
                            >
                                <option value="">All Promos</option>
                                {promos
                                    .filter((p) => p)
                                    .map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {(selectedCoach || selectedTrack || selectedPromo) && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => {
                                    setSelectedCoach('');
                                    setSelectedTrack('');
                                    setSelectedPromo('');
                                    router.visit('/training');
                                }}
                                className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 px-6 py-2 font-semibold text-white shadow-md transition-all hover:from-yellow-600 hover:to-yellow-500"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="mb-8">
                    {trainings && trainings.length > 0 && (
                        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
                                <div className="mb-2 text-4xl font-black text-yellow-600">{trainings.length}</div>
                                <div className="text-lg font-bold text-yellow-700">Total Programs</div>
                            </div>
                            <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
                                <div className="mb-2 text-4xl font-black text-yellow-600">
                                    {trainings.filter((t) => t.status === 'active').length}
                                </div>
                                <div className="text-lg font-bold text-yellow-700">Active Now</div>
                            </div>
                            <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
                                <div className="mb-2 text-4xl font-black text-yellow-600">{coaches.length}</div>
                                <div className="text-lg font-bold text-yellow-700">Expert Mentors</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Training Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
  {trainings && trainings.length > 0 ? (
    trainings.map((training) => (
      <div
        key={training.id}
        className="group cursor-pointer overflow-hidden rounded-xl border border-alpha/20 bg-light transition-all duration-300 hover:border-alpha/40 dark:bg-dark"
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
                : training.img
                ? `/storage/img/training/${training.img}`
                : "/assets/images/training/default.jpg"
            }
            alt={training.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Status Badge */}
          {training.status && (
            <div className="absolute top-3 left-3">
              <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  training.status === "active"
                    ? "bg-green-500/90 text-white"
                    : training.status === "upcoming"
                    ? "bg-blue-500/90 text-white"
                    : "bg-gray-500/90 text-white"
                }`}
              >
                {training.status}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="space-y-3 p-4">
  {/* Category + Action Buttons */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium tracking-wide text-alpha uppercase">
      {training.category}
    </span>

    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <UpdateTraining training={training} coaches={coaches} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openDeleteModal(training);
        }}
        className="rounded-lg p-1 text-red-600 border border-transparent hover:border-red-600 px-3 cursor-pointer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>

  {/* Title */}
  <h3 className="line-clamp-2 text-lg font-semibold text-dark dark:text-light">
    {training.name}
  </h3>

  {/* Description */}
  {training.description && (
    <p className="line-clamp-2 text-sm text-dark/70 dark:text-light/70">
      {training.description}
    </p>
  )}

  {/* Coach */}
  <div className="flex items-center space-x-2">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-alpha text-xs font-bold text-light">
      {training.coach
        ? training.coach.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "C"}
    </div>
    <span className="text-sm text-dark/70 dark:text-light/70">
      {training.coach?.name || "Expert Instructor"}
    </span>
  </div>

  {/* Timer & Users */}
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center space-x-1 text-dark/70 dark:text-light/70">
      <Timer size={14} />
      <span>{training.start_time || "N/A"}</span>
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
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <h3 className="mb-3 text-2xl font-bold text-gray-800">
        Ready to Create Something Amazing?
      </h3>
      <p className="mb-8 max-w-md text-center leading-relaxed text-gray-600">
        Start your journey by adding your first coding or media training program.
      </p>
      <CreatTraining coaches={coaches} />
    </div>
  )}
</div>

            </div>
            {deleteModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-dark">
            <h3 className="mb-4 text-lg font-bold text-dark dark:text-light">
                Confirm Deletion
            </h3>
            <p className="mb-6 text-sm text-dark/70 dark:text-light/70">
                Are you sure you want to delete "{trainingToDelete?.name}"?
            </p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={closeDeleteModal}
                    className="rounded bg-gray-300 px-4 py-2 text-dark hover:bg-gray-400 dark:bg-gray-700 dark:text-light dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmDelete}
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
)}

        </AppLayout>
    );
}
