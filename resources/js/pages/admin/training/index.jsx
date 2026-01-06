import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, Timer, Trash2, TrendingUp, User, Sparkles, Award, Clock, Target, GraduationCap, X, CheckCircle2, Building2, Calendar } from 'lucide-react';
import { useState } from 'react';
import CreatTraining from './partials/CreatTraining';
import { Avatar } from '@/components/ui/avatar';
import UpdateTraining from './partials/UpdateTraining';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Lesson-bro.png"
import StatCard from "@/components/StatCard";
import CoursesModal from "@/components/EXP'S/courses_modal";

export default function Training({ trainings, coaches, filters = {}, tracks = [], promos = [] }) {
    const [selectedCoach, setSelectedCoach] = useState(filters.coach || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track || '');
    const [selectedPromo, setSelectedPromo] = useState(filters.promo || '');
    const [hoveredCard, setHoveredCard] = useState(null);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const [modalOpen, setModalOpen] = useState(false);


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
            router.delete(`/trainings/${trainingToDelete?.id}`, {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const applyFilters = (trackValue = selectedTrack, coachValue = selectedCoach, promoValue = selectedPromo) => {
        const params = new URLSearchParams();
        if (coachValue) params.set('coach', coachValue);
        if (trackValue) params.set('track', trackValue);
        if (promoValue) params.set('promo', promoValue);

        router.visit(`/admin/training?${params.toString()}`);
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
    const filteredCoach = coaches.find((c) => c?.id == selectedCoach) || null;

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
    const coachTraining = trainings.find((c) => c.coach?.id == selectedCoach) || null;
    const statsData = [
        {
            title: "Total Programs",
            value: trainings.length,
            icon: BookOpen,
        },
        {
            title: "Active Now",
            value: activeTrainingsCount,
            icon: Timer,
        },
        {
            title: filteredCoach ? "Expert Mentor" : "Expert Mentors",
            value: filteredCoach ? filteredCoach.name : coaches.length,
            icon: Award,
            isSmallNumber: !!filteredCoach,
        },
    ];
    return (
        <AppLayout>
            <Head title="Training" />

            <div className="min-h-screen p-4 md:p-6">
                <Banner
                    illustration={illustration}
                    size={400}
                />
                {/* Premium Header */}
                <div className="mb-8 relative overflow-hidden rounded-3xl  p-8 ">


                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {/* <div className="w-16 h-16 rounded-2xl bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div> */}
                            <div>
                                <h1 className="dark:text-white text-4xl md:text-5xl font-black text-black mb-1 flex items-center gap-2">
                                    Training Programs
                                </h1>
                                <p className=" dark:text-white/40 text-black/40 text-lg font-medium">Discover amazing coding and media courses</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CoursesModal />
                        <CreatTraining coaches={coaches} />
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Premium Design */}
                {trainings && trainings.length > 0 && (
                    <StatCard statsData={statsData} />
                )}

                {/* Filters - Modern Design */}
                <div className="my-8 rounded-2xl border-2 border-yellow-200 dark:border-yellow-600/30 bg-white dark:bg-[#1c1c1c] p-6 shadow-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="text-lg font-bold text-dark dark:text-light">Filter Programs</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {/* Coach Filter */}
                        <div className="group">
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <User size={16} className="text-yellow-600 dark:text-yellow-400" />
                                Coach
                            </label>
                            <select
                                value={selectedCoach}
                                onChange={handleCoachChange}
                                className="w-full cursor-pointer rounded-xl border-2 border-yellow-200 dark:border-yellow-600/30 bg-yellow-50 dark:bg-[#222] px-4 py-3 text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 group-hover:shadow-md"
                            >
                                <option value="">All Coaches</option>
                                {coaches.map((c) => (
                                    <option key={c?.id} value={c?.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Track Filter */}
                        <div className="group">
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <BookOpen size={16} className="text-yellow-600 dark:text-yellow-400" />
                                Track
                            </label>
                            <select
                                value={selectedTrack}
                                onChange={handleTrackChange}
                                className="w-full cursor-pointer rounded-xl border-2 border-yellow-200 dark:border-yellow-600/30 bg-yellow-50 dark:bg-[#222] px-4 py-3 text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 group-hover:shadow-md"
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

                        {/* Promo Filter */}
                        <div className="group">
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-300">
                                <TrendingUp size={16} className="text-yellow-600 dark:text-yellow-400" />
                                Promo
                            </label>
                            <select
                                value={selectedPromo}
                                onChange={handlePromoChange}
                                className="w-full cursor-pointer rounded-xl border-2 border-yellow-200 dark:border-yellow-600/30 bg-yellow-50 dark:bg-[#222] px-4 py-3 text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 group-hover:shadow-md"
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


                    {(selectedTrack || selectedPromo || selectedCoach) && (
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setSelectedCoach('');
                                    setSelectedTrack('');
                                    setSelectedPromo('');
                                    router.visit('/admin/training');
                                }}
                                className="cursor-pointer flex items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                            >
                                Reset Filters
                            </button>


                        </div>
                    )}


                </div>

                {/* Training Cards - Premium Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {trainings && trainings.length > 0 ? (
                        trainings.map((training) => (
                            <div
                                key={training?.id}
                                onMouseEnter={() => setHoveredCard(training?.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className="group relative overflow-hidden rounded-2xl border-2 border-yellow-200 dark:border-yellow-600/30 bg-white dark:bg-[#1c1c1c] transition-all duration-300 hover:border-yellow-400 dark:hover:border-yellow-400  cursor-pointer shadow-lg hover:shadow-2xl"
                                onClick={() => router.visit(`/trainings/${training?.id}`)}
                            >


                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
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

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* Category Badge */}
                                    {training.category && (
                                        <span className="absolute top-3 left-3 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-black shadow-lg">
                                            {training.category}
                                        </span>
                                    )}

                                    {/* Status Badge */}
                                    {getTrainingStatus(training) === 'active' && (
                                        <span className="absolute top-3 right-3 rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse">
                                            Active
                                        </span>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="relative z-10 px-5  space-y-2">
                                    {training.name && (
                                        <h3 className="line-clamp-2 pt-3 text-xl font-bold text-dark dark:text-light  transition-colors">
                                            {training.name}
                                        </h3>
                                    )}
                                    {/* Coach Info */}
                                    {training.coach?.name && (
                                        <div className="relative group/coach">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/30 transition-all duration-300 group-hover/coach:translate-x-20 group-hover/coach:opacity-0">
                                                {/* <Avatar className="h-10 w-10 ring-2 ring-yellow-400">
                                                    <AvatarImage
                                                        className="h-full w-full object-cover"
                                                        src={training.coach.image}
                                                        alt={training.coach.name}
                                                    />
                                                    <AvatarFallback className="bg-yellow-400 text-black font-bold text-sm">
                                                        {getInitials(training.coach.name)}
                                                    </AvatarFallback>
                                                </Avatar> */}
                                                <Avatar
                                                    className="h-10 w-10"
                                                    image={training.coach.image}
                                                    name={training.coach.name}
                                                    onlineCircleClass="hidden"
                                                />
                                                <div>
                                                    <div className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                                                        Coach
                                                    </div>
                                                    <div className="text-sm font-bold text-dark dark:text-light">
                                                        {training.coach.name}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Preview Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedCoach(training.coach?.id)
                                                    setModalOpen(true)
                                                }}
                                                className="absolute text-black inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/30 dark:text-yellow-400 text-sm font-semibold rounded-xl
                 opacity-0 transform -translate-x-8 group-hover/coach:translate-x-0 group-hover/coach:opacity-100
                 transition-all duration-300"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    )}




                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between  border-t border-yellow-200 dark:border-yellow-600/30">
                                        <div className="flex items-center gap-4">
                                            {training.start_time && (
                                                <div className="flex items-center gap-1.5 text-dark/70 dark:text-light/70">
                                                    <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                                                    <span className="text-xs font-medium">{training.start_time}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-dark/70 dark:text-light/70">
                                                <User size={16} className="text-yellow-600 dark:text-yellow-400" />
                                                <span className="text-xs font-medium">{training.users_count ?? 0}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1 py-2 ">
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                            >
                                                <UpdateTraining training={training} coaches={coaches} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal(training);
                                                }}
                                                className="p-2 border border-transparent hover:border-red-600  px-3 cursor-pointer rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-6 shadow-2xl">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="mb-3 text-3xl font-black text-gray-800 dark:text-gray-200">Ready to Create Something Amazing?</h3>
                            <p className="mb-8 max-w-md text-center text-gray-600 dark:text-gray-400">
                                Start your journey by adding your first coding or media training program.
                            </p>
                            <CreatTraining coaches={coaches} />
                        </div>
                    )}
                </div>

                {/* Delete Modal - Premium */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl border-2 border-red-200 dark:border-red-600/30 bg-white dark:bg-[#1c1c1c] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-black text-dark dark:text-light">Confirm Deletion</h3>
                            </div>
                            <p className="mb-8 text-dark/70 dark:text-light/70">
                                Are you sure you want to delete <span className="font-bold text-yellow-600 dark:text-yellow-400">"{trainingToDelete?.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 rounded-xl bg-gray-200 dark:bg-gray-700 px-6 py-3 font-bold text-dark dark:text-light hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Coach Preview Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-br from-white via-yellow-50/30 to-white dark:from-[#1a1a1a] dark:via-yellow-950/10 dark:to-[#1a1a1a] shadow-2xl border border-yellow-200/50 dark:border-yellow-600/20 overflow-hidden animate-in zoom-in-95 duration-300">

                        <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                                        <User className="text-white" size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            Coach Profile
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Detailed Overview</p>
                                    </div>
                                </div>
                                <button
                                    onClick={e => { setSelectedCoach(''), closeModal() }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 hover:rotate-90"
                                >
                                    <X size={24} strokeWidth={2} />
                                </button>
                            </div>

                            {/* Coach Info */}
                            {filteredCoach ? (
                                <div className="space-y-6">
                                    {/* Avatar & Basic Info */}
                                    <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-yellow-50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/10 rounded-2xl border border-yellow-200/50 dark:border-yellow-600/20">
                                        <div className="relative">
                                            {/* <Avatar className="w-24 h-24 ring-4 ring-yellow-200/50 dark:ring-yellow-600/30 shadow-xl">
                                                {filteredCoach.image ? (
                                                    <AvatarImage
                                                        src={`/storage/img/profile/${filteredCoach.image}`}
                                                        alt={filteredCoach.name}
                                                        className="object-cover rounded-2xl"
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                                                            {getInitials(filteredCoach.name)}
                                                        </div>
                                                    </AvatarFallback>
                                                )}
                                            </Avatar> */}
                                            <Avatar
                                                className="w-24 h-24"
                                                image={filteredCoach?.image}
                                                name={filteredCoach?.name}
                                                lastActivity={filteredCoach?.last_online || null}
                                                onlineCircleClass="hidden"
                                                edit={true}
                                            />
                                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-lg shadow-lg">
                                                <CheckCircle2 size={16} className="text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{filteredCoach.name}</h4>

                                            {filteredCoach.entreprise && (
                                                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                                    <Building2 size={16} />
                                                    <span className="font-semibold text-sm">{filteredCoach.entreprise}</span>
                                                </div>
                                            )}

                                            {coachTraining?.category && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300/50 dark:border-yellow-600/30">
                                                    <Award size={14} className="text-yellow-600 dark:text-yellow-400" />
                                                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                                        {coachTraining.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    {filteredCoach.experience && (
                                        <div className="p-5 bg-white dark:bg-[#1f1f1f] rounded-2xl border border-yellow-200/50 dark:border-yellow-600/30">
                                            <h5 className="text-lg font-semibold text-gray-800 dark:text-yellow-300 mb-2">Experience</h5>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {filteredCoach.experience}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {filteredCoach.email && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-300/50 dark:border-yellow-600/30 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                                Email: {filteredCoach.email}
                                            </div>
                                        )}
                                        {filteredCoach.phone && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-300/50 dark:border-yellow-600/30 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                                Phone: {filteredCoach.phone}
                                            </div>
                                        )}
                                        {filteredCoach.status && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-300/50 dark:border-yellow-600/30 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                                Status: {filteredCoach.status}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Grid */}
                                    {(() => {
                                        const now = new Date();
                                        const completedCount = trainings.filter(t => {
                                            if (!t.coach || !t.start_time) return false;

                                            const startDate = new Date(t.start_time);
                                            const durationMonths = t.duration_months || 1;
                                            const diffMonths =
                                                (now.getFullYear() - startDate.getFullYear()) * 12 +
                                                (now.getMonth() - startDate.getMonth());

                                            return t.coach?.id === selectedCoach && diffMonths >= durationMonths;
                                        }).length;
                                        const trainingsActiv = trainings.filter(t => getTrainingStatus(t) === 'active' && t.coach?.id == selectedCoach).length
                                        const trainingsTotal = trainings.filter(t => t.coach && t.coach?.id == selectedCoach).length
                                        const pendingCount = trainings.filter(t => t.coach && t.coach?.id === selectedCoach).length - completedCount - trainingsActiv;
                                        const coachTrainings = trainings.filter(t => t.coach && t.coach.id === selectedCoach);

                                        const totalStudents = coachTrainings.reduce((sum, training) => {
                                            if (Array.isArray(training.users)) return sum + training.users.length;
                                            if (typeof training.users_count === 'number') return sum + training.users_count;
                                            return sum;
                                        }, 0);





                                        return (
                                            <>
                                                <h2 className="text-lg font-bold text-dark dark:text-light mb-4">
                                                    Trainings Statistics
                                                </h2>
                                                <div className="grid grid-cols-4 gap-6">
                                                    {[
                                                        { label: 'Students', value: totalStudents },
                                                        { label: 'Trainings', value: trainingsTotal },
                                                        // { label: 'Pending', value: pendingCount },
                                                        { label: 'Active', value: trainingsActiv },
                                                        { label: 'Done', value: completedCount },
                                                    ].map((stat, i) => (
                                                        <div key={i} className="group relative p-5 bg-white dark:bg-[#1f1f1f] rounded-xl border border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all hover:shadow-lg hover:-translate-y-1">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            <div className="relative text-center">
                                                                <p className="text-4xl font-extrabold bg-gradient-to-br from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                                                                    {stat.value}
                                                                </p>
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                                                                    {stat.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            </>
                                        )
                                    })()}

                                    {/* Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => router.visit(`/admin/users/${filteredCoach?.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <Calendar size={20} />
                                            View profile
                                        </button>
                                        <button
                                            onClick={e => { setSelectedCoach(''), closeModal() }}
                                            className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Close
                                        </button>
                                    </div>


                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-center">No coach selected.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
