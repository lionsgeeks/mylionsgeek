import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Timer, Trash2, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import CreatTraining from './partials/CreatTraining';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import UpdateTraining from './partials/UpdateTraining';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Lesson-bro.png"


export default function Training({ trainings, coaches, filters = {}, tracks = [], promos = [] }) {
    const [selectedCoach, setSelectedCoach] = useState(filters.coach || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track || '');
    const [selectedPromo, setSelectedPromo] = useState(filters.promo || '');
    const getInitials = useInitials();

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
        applyFilters(selectedTrack, value, selectedPromo);
    };

    const handleTrackChange = (e) => {
        const value = e.target.value;
        setSelectedTrack(value);
        applyFilters(value, selectedCoach, selectedPromo);
    };

    const handlePromoChange = (e) => {
        const value = e.target.value;
        setSelectedPromo(value);
        applyFilters(selectedTrack, selectedCoach, value);
    };

    const getTrainingStatus = (training) => {
        const start = new Date(training.start_time);
        const now = new Date();
        const sixMonthsLater = new Date(start);
        sixMonthsLater.setMonth(start.getMonth() + 6);
        if (now < sixMonthsLater && start < now) return 'active';
    };

    const activeTrainingsCount = trainings.filter((t) => getTrainingStatus(t) === 'active').length;
    return (
        <AppLayout>
            <Head title="Training" />

            <div className="min-h-screen p-6">
                <Banner
                    illustration={illustration}
                    size={400}

                />
                {/* Header with Button */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="bg-dark bg-clip-text text-4xl font-extrabold text-transparent dark:bg-light">Training Programs</h1>
                        <p className="mt-2 text-dark/70 dark:text-light/70">Discover amazing coding and media courses</p>
                    </div>
                    <CreatTraining coaches={coaches} />
                </div>

                {/* Filters */}
                <div className="mb-10 rounded-xl border border-gray-200 p-6 transition-all duration-300 dark:border-yellow-400/20 dark:bg-[#1c1c1c]/80">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {/* Coach */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <User size={18} className="text-yellow-600 dark:text-yellow-400" />
                                Coach
                            </label>
                            <select
                                value={selectedCoach}
                                onChange={handleCoachChange}
                                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 shadow-sm transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-600/40 dark:border-yellow-400/20 dark:bg-[#222] dark:text-gray-200"
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
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <BookOpen size={18} className="text-yellow-600 dark:text-yellow-400" />
                                Track
                            </label>
                            <select
                                value={selectedTrack}
                                onChange={handleTrackChange}
                                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 shadow-sm transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-600/40 dark:border-yellow-400/20 dark:bg-[#222] dark:text-gray-200"
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
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <TrendingUp size={18} className="text-yellow-600 dark:text-yellow-400" />
                                Promo
                            </label>
                            <select
                                value={selectedPromo}
                                onChange={handlePromoChange}
                                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 shadow-sm transition-all focus:border-yellow-500 focus:ring-2 focus:ring-yellow-600/40 dark:border-yellow-400/20 dark:bg-[#222] dark:text-gray-200"
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

                    {(selectedCoach || selectedTrack || selectedPromo) && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => {
                                    setSelectedCoach('');
                                    setSelectedTrack('');
                                    setSelectedPromo('');
                                    router.visit('/training');
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-transparent"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                {trainings && trainings.length > 0 && (
                    <div className="mt-10 mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="group rmb-10 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-6 transition-all duration-300 dark:border-yellow-400/20 dark:bg-[#1c1c1c]/80">
                            <div className="mb-3 rounded-full bg-yellow-200 p-3 transition-transform group-hover:scale-110 dark:bg-yellow-400/10">
                                <BookOpen size={34} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{trainings.length}</div>
                            <div className="mt-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">Total Programs</div>
                        </div>

                        <div className="group rmb-10 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-6 transition-all duration-300 dark:border-yellow-400/20 dark:bg-[#1c1c1c]/80">
                            <div className="mb-3 rounded-full bg-yellow-200 p-3 transition-transform group-hover:scale-110 dark:bg-yellow-400/10">
                                <Timer size={34} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{activeTrainingsCount}</div>
                            <div className="mt-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">Active Now</div>
                        </div>

                        <div className="group rmb-10 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-6 transition-all duration-300 dark:border-yellow-400/20 dark:bg-[#1c1c1c]/80">
                            <div className="mb-3 rounded-full bg-yellow-200 p-3 transition-transform group-hover:scale-110 dark:bg-yellow-400/10">
                                <User size={34} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{coaches.length}</div>
                            <div className="mt-2 text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">Expert Mentors</div>
                        </div>
                    </div>
                )}

                {/* Training Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {trainings && trainings.length > 0 ? (
                        trainings.map((training) => (
                            <div
                                key={training.id}
                                className="group cursor-pointer overflow-hidden rounded-xl border border-alpha/20 bg-light transition-all duration-300 hover:border-alpha/40 dark:bg-dark"
                                onClick={() => router.visit(`/trainings/${training.id}`)}
                            >
                                {/* Image + Category Badge */}
                                <div className="relative h-40 overflow-hidden">
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
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {training.category && (
                                        <span
                                            className={`absolute top-2 left-2 rounded-full bg-[var(--color-alpha)] px-2 py-1 text-xs font-semibold text-black`}
                                        >
                                            {training.category}
                                        </span>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="flex flex-col gap-2 p-3">
                                    {training.name && (
                                        <h3 className="line-clamp-2 text-lg font-semibold text-dark dark:text-light">{training.name}</h3>
                                    )}
                                    {training.description && (
                                        <p className="line-clamp-2 text-sm text-dark/70 dark:text-light/70">{training.description}</p>
                                    )}

                                    {/* Coach */}
                                    {training.coach?.name && (
                                        <div className="mt-2 flex items-center space-x-2">
                                            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                <AvatarImage className='h-full w-full object-cover' src={training.coach.image} alt={training.coach.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-[13px]">
                                                    {getInitials(training.coach.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-dark/70 dark:text-light/70">{training.coach.name}</span>
                                        </div>
                                    )}


                                    {/* Timer & Users */}
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        {training.start_time && (
                                            <div className="flex items-center space-x-1 text-dark/70 dark:text-light/70">
                                                <Timer size={14} />
                                                <span>{training.start_time}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex items-center space-x-1 text-dark/70 dark:text-light/70">
                                                <User size={14} />
                                                <span>{training.users_count ?? 0}</span>
                                            </div>
                                            {/* Actions Row */}
                                            <div className="flex items-center justify-center">
                                                <button onClick={(e) => e.stopPropagation()}>
                                                    <UpdateTraining training={training} coaches={coaches} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(training);
                                                    }}
                                                    className="cursor-pointer rounded-lg border border-transparent p-2 px-3 text-red-600 hover:border-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <h3 className="mb-3 text-2xl font-bold text-gray-800">Ready to Create Something Amazing?</h3>
                            <p className="mb-8 max-w-md text-center leading-relaxed text-gray-600">
                                Start your journey by adding your first coding or media training program.
                            </p>
                            <CreatTraining coaches={coaches} />
                        </div>
                    )}
                </div>

                {/* Delete Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-dark">
                            <h3 className="mb-4 text-lg font-bold text-dark dark:text-light">Confirm Deletion</h3>
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
                                <button onClick={confirmDelete} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
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
