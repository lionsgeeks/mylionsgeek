import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { 
    Play, Pause, StopCircle, SkipForward, Users, Clock, 
    Trophy, ArrowLeft, Eye, RefreshCw, UserMinus, Share2
} from 'lucide-react';

export default function SessionControl({ session, currentQuestion, leaderboard, formationId, geekoId }) {
    const [liveData, setLiveData] = useState({
        participants_count: session.participants?.length || 0,
        current_answer_count: 0,
        progress: {
            current: session.current_question_index + 1,
            total: session.geeko.questions?.length || 0
        }
    });
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Poll for live updates
    useEffect(() => {
        if (!autoRefresh) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/live-data`);
                const data = await response.json();
                setLiveData(data);

                // Auto end question when conditions met (time up or all answered)
                if (data.should_end_question) {
                    router.visit(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/end-question`);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch live data:', error);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [autoRefresh, formationId, geekoId, session.id]);

    const handleStartGame = () => {
        router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/start`);
    };

    const handleNextQuestion = () => {
        // first show round results page for players
        router.visit(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/end-question`);
    };

    const handleEndQuestion = () => {
        router.visit(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/end-question`);
    };

    const handleCompleteGame = () => {
        router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/complete`);
    };

    const handleCancelGame = () => {
        if (confirm('Are you sure you want to cancel this game session? This cannot be undone.')) {
            router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/cancel`);
        }
    };

    const handleViewResults = () => {
        router.visit(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/results`);
    };

    const handleRemoveParticipant = (participantId) => {
        if (confirm('Are you sure you want to remove this participant?')) {
            router.delete(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/participants/${participantId}`);
        }
    };

    const copyGamePin = () => {
        navigator.clipboard.writeText(session.session_code);
        alert('Game PIN copied to clipboard!');
    };

    const copyGameLink = () => {
        const link = `${window.location.origin}/geeko/${session.session_code}`;
        navigator.clipboard.writeText(link);
        alert('Game link copied to clipboard!');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting': return 'text-alpha';
            case 'in_progress': return 'text-good';
            case 'completed': return 'text-blue-500';
            case 'cancelled': return 'text-error';
            default: return 'text-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'waiting': return 'Waiting to Start';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    return (
        <AppLayout>
            <Head title={`Control Panel - ${session.geeko.title}`} />

            <div className="min-h-screen bg-gray-50/50 dark:bg-dark/30">
                {/* Ultra Minimalist Header */}
                <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-sm border-b border-alpha/5">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex items-center justify-between h-14">
                            <button 
                                onClick={() => router.visit(`/training/${formationId}/geeko/${geekoId}`)}
                                className="flex items-center space-x-1 text-dark/50 dark:text-light/50 hover:text-alpha transition-colors text-sm"
                            >
                                <ArrowLeft size={16} />
                                <span>Back</span>
                            </button>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`p-2 rounded-md text-xs transition-colors ${
                                        autoRefresh 
                                            ? 'bg-good text-light' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title={autoRefresh ? 'Auto-refresh enabled' : 'Click to enable auto-refresh'}
                                >
                                    <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
                                </button>
                                
                                {session.status === 'completed' && (
                                    <button
                                        onClick={handleViewResults}
                                        className="p-2 bg-alpha text-dark rounded-md hover:bg-alpha/90 transition-colors text-xs"
                                        title="View game results"
                                    >
                                        <Trophy size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="pb-3">
                            <h1 className="text-lg font-medium text-dark dark:text-light">
                                {session.geeko.title}
                            </h1>
                            <div className="flex items-center space-x-3 text-xs text-dark/50 dark:text-light/50">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    session.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                    session.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                                    session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {getStatusText(session.status)}
                                </span>
                                <span>{session.geeko.questions?.length || 0} questions</span>
                                <span>•</span>
                                <span>{liveData.participants_count} participants</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ultra Compact Layout */}
                <div className="max-w-6xl mx-auto px-4 py-4">
                    {/* Game PIN Bar */}
                    <div className="bg-white dark:bg-dark border border-alpha/10 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-alpha">{session.session_code}</div>
                                    <div className="text-xs text-dark/50 dark:text-light/50">Game PIN</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-blue-500">
                                        {liveData.progress.current}/{liveData.progress.total}
                                    </div>
                                    <div className="text-xs text-dark/50 dark:text-light/50">Progress</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={copyGamePin}
                                    className="flex items-center space-x-1 bg-alpha text-dark px-3 py-1.5 rounded-md hover:bg-alpha/90 transition-colors text-xs font-medium"
                                >
                                    <Share2 size={12} />
                                    <span>Copy PIN</span>
                                </button>
                                <button
                                    onClick={copyGameLink}
                                    className="flex items-center space-x-1 border border-alpha/30 text-dark dark:text-light px-3 py-1.5 rounded-md hover:bg-alpha/10 transition-colors text-xs font-medium"
                                >
                                    <Share2 size={12} />
                                    <span>Link</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Controls */}
                    <div className="bg-white dark:bg-dark border border-alpha/10 rounded-lg p-4 mb-4">
                        {/* Current Question Info */}
                        {currentQuestion && (
                            <div className="bg-gray-50 dark:bg-dark/60 rounded-md p-3 mb-3">
                                <div className="text-sm font-medium text-dark dark:text-light mb-1">
                                    Question {session.current_question_index + 1}/{session.geeko.questions?.length}
                                </div>
                                <p className="text-sm text-dark/70 dark:text-light/70 line-clamp-2">
                                    {currentQuestion.question}
                                </p>
                            </div>
                        )}

                        {/* Control Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {session.status === 'waiting' && (
                                <button
                                    onClick={handleStartGame}
                                    className="flex items-center space-x-2 bg-good text-light px-4 py-2 rounded-md hover:bg-good/90 transition-colors font-medium text-sm"
                                >
                                    <Play size={14} />
                                    <span>Start Game</span>
                                </button>
                            )}

                            {session.status === 'in_progress' && (
                                <>
                                    <button
                                        onClick={handleEndQuestion}
                                        className="flex items-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-md hover:bg-alpha/90 transition-colors font-medium text-sm"
                                    >
                                        <Eye size={14} />
                                        <span>Show Results</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleNextQuestion}
                                        className="flex items-center space-x-2 bg-blue-500 text-light px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm"
                                    >
                                        <SkipForward size={14} />
                                        <span>Next</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleCompleteGame}
                                        className="flex items-center space-x-2 border border-purple-300 text-purple-600 px-4 py-2 rounded-md hover:bg-purple-50 transition-colors font-medium text-sm"
                                    >
                                        <Trophy size={12} />
                                        <span>Complete</span>
                                    </button>
                                </>
                            )}

                            {(session.status === 'waiting' || session.status === 'in_progress') && (
                                <button
                                    onClick={handleCancelGame}
                                    className="flex items-center space-x-2 border border-error text-error px-4 py-2 rounded-md hover:bg-error/10 transition-colors font-medium text-sm"
                                >
                                    <StopCircle size={12} />
                                    <span>Cancel</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Live Leaderboard - Prominent */}
                    <div className="bg-white dark:bg-dark border border-alpha/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-dark dark:text-light">Live Leaderboard</h3>
                            <div className="flex items-center space-x-2 text-xs text-dark/50 dark:text-light/50">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live</span>
                            </div>
                        </div>
                        
                        {leaderboard && leaderboard.length > 0 ? (
                            <div className="space-y-1">
                                {leaderboard.slice(0, 10).map((participant, index) => (
                                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-dark/40 rounded-md hover:bg-gray-100 dark:hover:bg-dark/60 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                                index === 2 ? 'bg-amber-500 text-amber-900' :
                                                'bg-alpha/20 text-alpha'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-dark dark:text-light text-sm">
                                                    {participant.nickname || participant.user?.name}
                                                </p>
                                                <p className="text-xs text-dark/50 dark:text-light/50">
                                                    {participant.correct_answers}/{participant.correct_answers + participant.wrong_answers} correct
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-bold text-alpha text-sm">{participant.total_score}</p>
                                            <button
                                                onClick={() => handleRemoveParticipant(participant.id)}
                                                className="text-xs text-error hover:text-error/80 p-1 rounded hover:bg-error/10 transition-colors"
                                                title="Remove participant"
                                            >
                                                <UserMinus size={10} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Users className="mx-auto text-alpha/40 mb-2" size={24} />
                                <p className="text-sm text-dark/50 dark:text-light/50">
                                    No participants yet. Share the game PIN!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                    {/* Quick Instructions */}
                    {session.status === 'waiting' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-start space-x-2 text-xs text-blue-700 dark:text-blue-300">
                                <span className="font-bold">💡</span>
                                <span>Share PIN <strong>{session.session_code}</strong> with students • They join at <strong>/geeko/join</strong> • Click "Start Game" when ready</span>
                            </div>
                        </div>
                    )}
            </div>
        </AppLayout>
    );
}
