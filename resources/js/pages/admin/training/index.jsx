import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Timer, Trash2, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import CreatTraining from './partials/CreatTraining';
import UpdateTraining from './partials/UpdateTraining';

export default function Training({ trainings, coaches, filters = {}, tracks = [], promos = [] }) {
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
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const applyFilters = (trackValue = selectedTrack, coachValue = selectedCoach, promoValue = selectedPromo) => {
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

    const handleTrackChange = (e) => {
        const value = e.target.value;
        setSelectedTrack(value);
        applyFilters(value, selectedCoach);
    };

    const handlePromoChange = (e) => {
        const value = e.target.value;
        setSelectedPromo(value);
        applyFilters(selectedTrack, selectedCoach, value);
    };

    return (
        <AppLayout>
            <Head title="Training" />

            <div className="min-h-screen px-4 py-8 transition-all duration-300 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div>
                        <h1 className="bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl dark:from-yellow-300 dark:to-yellow-500">
                            Training Programs
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">Discover amazing coding and media courses</p>
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

                {/* Stats */}
                {trainings?.length > 0 && (
                    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: 'Total Programs', value: trainings.length },
                            { label: 'Active Now', value: trainings.filter((t) => t.status === 'active').length },
                            { label: 'Expert Mentors', value: coaches.length },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="transform rounded-2xl border border-yellow-300 bg-yellow-400 p-8 text-center shadow-md transition-all hover:-translate-y-2 hover:shadow-xl dark:bg-gray-950/50"
                            >
                                <div className="mb-2 text-4xl font-extrabold drop-shadow-sm sm:text-5xl dark:text-white">{stat.value}</div>
                                <div className="text-base font-semibold sm:text-lg dark:text-white">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trainings Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {trainings && trainings.length > 0 ? (
                        trainings.map((training) => (
                            <div
                                key={training.id}
                                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/30 dark:border-yellow-400 dark:bg-gray-950"
                                onClick={() => router.visit(`/trainings/${training.id}`)}
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden sm:h-48">
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
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Overlay Buttons */}
                                    <div className="absolute top-3 right-3 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <UpdateTraining training={training} coaches={coaches} />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(training);
                                            }}
                                            className="rounded-md bg-red-500/90 px-3 py-2 text-white shadow-md transition hover:bg-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Status */}
                                    {training.status && (
                                        <span
                                            className={`absolute top-3 left-3 z-20 rounded-full px-3 py-1 text-xs font-bold uppercase shadow-md ${
                                                training.status === 'active'
                                                    ? 'bg-green-500 text-white'
                                                    : training.status === 'upcoming'
                                                      ? 'bg-blue-500 text-white'
                                                      : 'bg-gray-500 text-white'
                                            }`}
                                        >
                                            {training.status}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-3 p-5">
                                    <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                                        <span className="text-sm font-bold tracking-wider text-yellow-600 uppercase dark:text-yellow-400">
                                            {training.category}
                                        </span>
                                        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-gray-800 sm:text-xl dark:text-white">
                                            {training.name}
                                        </h3>
                                    </div>

                                    {training.description && (
                                        <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{training.description}</p>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white shadow-md">
                                            {training.coach?.name
                                                ? training.coach.name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .join('')
                                                      .toUpperCase()
                                                : 'C'}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {training.coach?.name || 'Expert Instructor'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Timer size={16} className="text-yellow-500" />
                                            <span>{training.start_time || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User size={16} className="text-yellow-500" />
                                            <span>{training.users_count ?? 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-200">Ready to Create Something Amazing?</h3>
                            <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
                                Start your journey by adding your first coding or media training program.
                            </p>
                            <CreatTraining coaches={coaches} />
                        </div>
                    )}
                </div>

                {/* Delete Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">Confirm Deletion</h3>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete "{trainingToDelete?.name}"?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-5 py-2 font-semibold text-white shadow-md transition-all hover:from-red-600 hover:to-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
