import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Timer, User } from 'lucide-react';
import { useState } from 'react';
import CreatTraining from './partials/CreatTraining';

export default function Training({ trainings, coaches, filters = {}, tracks = [],promos=[]}) {
    const [selectedCoach, setSelectedCoach] = useState(filters.coach || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track || '');
    const [selectedPromo, setSelectedPromo] = useState(filters.promo || '');

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
                <div className="mb-6 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-sm text-dark/70 dark:text-light/70">Coach</label>
                        <select
                            value={selectedCoach}
                            onChange={handleCoachChange}
                            className="rounded-lg border border-alpha/30 bg-light px-3 py-2 dark:bg-dark"
                        >
                            <option value="">All</option>
                            {coaches.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-dark/70 dark:text-light/70">Track</label>
                        <select
                            value={selectedTrack}
                            onChange={handleTrackChange}
                            className="rounded-lg border border-alpha/30 bg-light px-3 py-2 dark:bg-dark"
                        >
                            <option value="">All</option>
                            {tracks
                                .filter((t) => t !== null && t !== '')
                                .map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-dark/70 dark:text-light/70">Promo</label>
                        <select
                            value={selectedPromo}
                            onChange={handlePromoChange}
                            className="rounded-lg border border-alpha/30 bg-light px-3 py-2 dark:bg-dark"
                        >
                            <option value="">All</option>
                            {promos
                                .filter((t) => t !== null && t !== '')
                                .map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Bouton pour réinitialiser les filtres */}
                    {(selectedCoach || selectedTrack || selectedPromo) && (
                        <button
                            onClick={() => {
                                setSelectedCoach('');
                                setSelectedTrack('');
                                setSelectedPromo('');
                                router.visit('/training');
                            }}
                            className="rounded-lg bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
                        >
                            Reset
                        </button>
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
                                            training.category?.toLowerCase() === 'coding'
                                                ? '/assets/images/training/coding.jpg'
                                                : training.category?.toLowerCase() === 'media'
                                                  ? '/assets/images/training/media.jpg'
                                                  : training.img || '/assets/images/training/default.jpg'
                                        }
                                        alt={training.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Status Badge */}
                                    {training.status && (
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`rounded-md px-2 py-1 text-xs font-medium ${
                                                    training.status === 'active'
                                                        ? 'bg-green-500/90 text-white'
                                                        : training.status === 'upcoming'
                                                          ? 'bg-blue-500/90 text-white'
                                                          : 'bg-gray-500/90 text-white'
                                                }`}
                                            >
                                                {training.status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="space-y-3 p-4">
                                    <div>
                                        <span className="text-xs font-medium tracking-wide text-alpha uppercase">{training.category}</span>
                                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-dark dark:text-light">{training.name}</h3>
                                    </div>

                                    {training.description && (
                                        <p className="line-clamp-2 text-sm text-dark/70 dark:text-light/70">{training.description}</p>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-alpha text-xs font-bold text-light">
                                            {training.coach
                                                ? training.coach.name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .join('')
                                                      .toUpperCase()
                                                : 'C'}
                                        </div>
                                        <span className="text-sm text-dark/70 dark:text-light/70">{training.coach?.name || 'Expert Instructor'}</span>
                                    </div>

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
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <h3 className="mb-3 text-2xl font-bold text-gray-800">Ready to Create Something Amazing?</h3>
                            <p className="mb-8 max-w-md text-center leading-relaxed text-gray-600">
                                Start your journey by adding your first coding or media training program.
                            </p>
                            <CreatTraining coaches={coaches} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
