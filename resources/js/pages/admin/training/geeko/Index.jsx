import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus, Play, Users, Clock, Settings, Trash2, Edit3, Trophy } from 'lucide-react';

export default function GeekoIndex({ formation, geekos }) {
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleCreateGeeko = () => {
        router.visit(`/training/${formation.id}/geeko/create`);
    };

    const handleEditGeeko = (geekoId) => {
        router.visit(`/training/${formation.id}/geeko/${geekoId}/edit`);
    };

    const handleViewGeeko = (geekoId) => {
        router.visit(`/training/${formation.id}/geeko/${geekoId}`);
    };

    const handleDeleteGeeko = (geekoId) => {
        router.delete(`/training/${formation.id}/geeko/${geekoId}`, {
            onSuccess: () => setConfirmDelete(null)
        });
    };

    const handleStartSession = (geekoId) => {
        router.post(`/training/${formation.id}/geeko/${geekoId}/session/create`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'bg-gray-500';
            case 'ready': return 'bg-alpha';
            case 'published': return 'bg-good';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft': return 'Draft';
            case 'ready': return 'Ready';
            case 'published': return 'Published';
            default: return status;
        }
    };

    return (
        <AppLayout>
            <Head title={`Geeko - ${formation.name}`} />

            <div className="min-h-screen p-6 bg-light dark:bg-dark">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <button 
                                onClick={() => router.visit(`/trainings/${formation.id}`)}
                                className="text-alpha hover:text-alpha/80 font-semibold"
                            >
                                ← {formation.name}
                            </button>
                        </div>
                        <h1 className="text-4xl font-extrabold text-dark dark:text-light">
                            Geeko Games
                        </h1>
                        <p className="mt-2 text-dark/70 dark:text-light/70">
                            Create and manage interactive quiz games for your students
                        </p>
                    </div>
                    <button
                        onClick={handleCreateGeeko}
                        className="flex items-center space-x-2 bg-alpha text-dark px-6 py-3 rounded-xl font-bold hover:bg-alpha/90 transition-all duration-300 hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Create New Geeko</span>
                    </button>
                </div>

                {/* Stats Cards */}
                {geekos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-alpha mb-2">{geekos.length}</div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Total Geekos</div>
                        </div>
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-good mb-2">
                                {geekos.filter(g => g.status === 'ready').length}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Ready to Play</div>
                        </div>
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-500 mb-2">
                                {geekos.reduce((total, g) => total + (g.questions?.length || 0), 0)}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Total Questions</div>
                        </div>
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-purple-500 mb-2">
                                {geekos.reduce((total, g) => total + (g.sessions?.length || 0), 0)}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Total Sessions</div>
                        </div>
                    </div>
                )}

                {/* Geekos Grid */}
                {geekos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {geekos.map((geeko) => (
                            <div
                                key={geeko.id}
                                className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 hover:border-alpha/40 transition-all duration-300 hover:shadow-lg"
                            >
                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-light ${getStatusColor(geeko.status)}`}>
                                        {getStatusText(geeko.status)}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditGeeko(geeko.id)}
                                            className="p-2 rounded-lg border border-alpha/30 hover:bg-alpha/10 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(geeko.id)}
                                            className="p-2 rounded-lg border border-error/30 hover:bg-error/10 text-error transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <div className="w-full h-32 bg-gradient-to-br from-alpha/20 to-alpha/40 rounded-xl mb-4 flex items-center justify-center">
                                    {geeko.cover_image ? (
                                        <img
                                            src={`/storage/${geeko.cover_image}`}
                                            alt={geeko.title}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <div className="text-2xl font-bold text-alpha">QUIZ</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-dark dark:text-light line-clamp-2">
                                        {geeko.title}
                                    </h3>
                                    
                                    {geeko.description && (
                                        <p className="text-dark/70 dark:text-light/70 text-sm line-clamp-2">
                                            {geeko.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center space-x-2 text-dark/70 dark:text-light/70">
                                            <Users size={14} />
                                            <span>{geeko.questions?.length || 0} Questions</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-dark/70 dark:text-light/70">
                                            <Clock size={14} />
                                            <span>{geeko.time_limit}s per Q</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-dark/70 dark:text-light/70">
                                            <Play size={14} />
                                            <span>{geeko.sessions?.length || 0} Sessions</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-dark/70 dark:text-light/70">
                                            <Trophy size={14} />
                                            <span>By {geeko.creator?.name}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2 pt-3">
                                        <button
                                            onClick={() => handleViewGeeko(geeko.id)}
                                            className="flex-1 flex items-center justify-center space-x-2 border border-alpha/30 text-dark dark:text-light px-4 py-2 rounded-lg hover:bg-alpha/10 transition-colors"
                                        >
                                            <Settings size={16} />
                                            <span>Manage</span>
                                        </button>
                                        
                                        {geeko.status === 'ready' && (
                                            <button
                                                onClick={() => handleStartSession(geeko.id)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-lg hover:bg-alpha/90 transition-colors font-semibold"
                                            >
                                                <Play size={16} />
                                                <span>Start Game</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 mx-auto mb-6 bg-alpha/20 rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-alpha">QUIZ</span>
                        </div>
                        <h3 className="text-2xl font-bold text-dark dark:text-light mb-4">
                            No Geeko Games Yet
                        </h3>
                        <p className="text-dark/70 dark:text-light/70 mb-8 max-w-md mx-auto">
                            Create your first interactive quiz game to engage your students with fun learning experiences.
                        </p>
                        <button
                            onClick={handleCreateGeeko}
                            className="inline-flex items-center space-x-2 bg-alpha text-dark px-8 py-4 rounded-xl font-bold hover:bg-alpha/90 transition-all duration-300 hover:scale-105"
                        >
                            <Plus size={20} />
                            <span>Create Your First Geeko</span>
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-dark dark:text-light mb-4">
                                Delete Geeko Game
                            </h3>
                            <p className="text-dark/70 dark:text-light/70 mb-6">
                                Are you sure you want to delete this Geeko? This action cannot be undone and will remove all associated questions and session data.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-2 border border-alpha/30 rounded-lg hover:bg-alpha/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteGeeko(confirmDelete)}
                                    className="flex-1 px-4 py-2 bg-error text-light rounded-lg hover:bg-error/90 transition-colors"
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
