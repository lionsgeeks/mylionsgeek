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
        router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/next-question`);
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

            <div className="min-h-screen p-6 bg-gradient-to-br from-alpha/5 to-transparent dark:from-alpha/10 dark:to-transparent">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => router.visit(`/training/${formationId}/geeko/${geekoId}`)}
                        className="flex items-center space-x-2 text-alpha hover:text-alpha/80 font-semibold mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Geeko</span>
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-dark dark:text-light">
                                Game Control Panel
                            </h1>
                            <p className="mt-2 text-dark/70 dark:text-light/70">
                                {session.geeko.title} - {getStatusText(session.status)}
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    autoRefresh 
                                        ? 'bg-good text-light' 
                                        : 'border border-alpha/30 text-dark dark:text-light hover:bg-alpha/10'
                                }`}
                            >
                                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                                <span>Auto Refresh</span>
                            </button>
                            
                            {session.status === 'completed' && (
                                <button
                                    onClick={handleViewResults}
                                    className="flex items-center space-x-2 bg-alpha text-dark px-4 py-2 rounded-lg hover:bg-alpha/90 transition-colors font-semibold"
                                >
                                    <Trophy size={16} />
                                    <span>View Results</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Game PIN Section */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-dark dark:text-light mb-4">Game Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="backdrop-blur bg-white/50 dark:bg-dark/40 border border-white/20 rounded-xl p-4 shadow">
                                <p className="text-dark/70 dark:text-light/70 font-semibold mb-2">Game PIN</p>
                                <p className="text-3xl font-bold text-alpha tracking-wider mb-3">
                                    {session.session_code}
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={copyGamePin}
                                        className="flex-1 bg-alpha text-dark px-3 py-2 rounded-lg hover:bg-alpha/90 transition-colors font-semibold text-sm"
                                    >
                                        Copy PIN
                                    </button>
                                    <button
                                        onClick={copyGameLink}
                                        className="flex-1 border border-alpha/30 text-dark dark:text-light px-3 py-2 rounded-lg hover:bg-alpha/10 transition-colors font-semibold text-sm"
                                    >
                                        <Share2 size={14} className="inline mr-1" />
                                        Link
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="backdrop-blur bg-white/50 dark:bg-dark/40 border border-white/20 rounded-xl p-4 shadow">
                                <p className="text-dark/70 dark:text-light/70 font-semibold mb-2">Status</p>
                                <p className={`text-2xl font-bold mb-3 ${getStatusColor(session.status)}`}>
                                    {getStatusText(session.status)}
                                </p>
                                <p className="text-sm text-dark/60 dark:text-light/60">
                                    {session.status === 'waiting' && 'Share the PIN with students'}
                                    {session.status === 'in_progress' && 'Game is running'}
                                    {session.status === 'completed' && 'Game finished'}
                                    {session.status === 'cancelled' && 'Game was cancelled'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="backdrop-blur bg-white/50 dark:bg-dark/40 border border-white/20 rounded-xl p-4 shadow">
                                <p className="text-dark/70 dark:text-light/70 font-semibold mb-2">Progress</p>
                                <p className="text-2xl font-bold text-blue-500 mb-3">
                                    {liveData.progress.current} / {liveData.progress.total}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(liveData.progress.current / liveData.progress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 text-center shadow">
                        <Users className="mx-auto text-alpha mb-3" size={32} />
                        <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                            {liveData.participants_count}
                        </div>
                        <div className="text-dark/70 dark:text-light/70 font-semibold">Participants</div>
                    </div>
                    
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 text-center shadow">
                        <Clock className="mx-auto text-alpha mb-3" size={32} />
                        <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                            {session.geeko.time_limit}s
                        </div>
                        <div className="text-dark/70 dark:text-light/70 font-semibold">Per Question</div>
                    </div>
                    
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 text-center shadow">
                        <Play className="mx-auto text-alpha mb-3" size={32} />
                        <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                            {session.geeko.questions?.length || 0}
                        </div>
                        <div className="text-dark/70 dark:text-light/70 font-semibold">Questions</div>
                    </div>
                    
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 text-center shadow">
                        <Eye className="mx-auto text-alpha mb-3" size={32} />
                        <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                            {liveData.current_answer_count}
                        </div>
                        <div className="text-dark/70 dark:text-light/70 font-semibold">Answered</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Game Controls */}
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Game Controls</h2>
                        
                        {/* Current Question Info */}
                        {currentQuestion && (
                            <div className="bg-alpha/10 border border-alpha/20 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-dark dark:text-light mb-2">
                                    Current Question ({session.current_question_index + 1}/{session.geeko.questions?.length})
                                </h3>
                                <p className="text-dark/70 dark:text-light/70 text-sm line-clamp-2">
                                    {currentQuestion.question}
                                </p>
                            </div>
                        )}

                        {/* Control Buttons */}
                        <div className="space-y-4">
                            {session.status === 'waiting' && (
                                <button
                                    onClick={handleStartGame}
                                    className="w-full flex items-center justify-center space-x-2 bg-good text-light px-6 py-4 rounded-xl hover:bg-good/90 transition-colors font-bold text-lg"
                                >
                                    <Play size={20} />
                                    <span>Start Game</span>
                                </button>
                            )}

                            {session.status === 'in_progress' && (
                                <>
                                    <button
                                        onClick={handleEndQuestion}
                                        className="w-full flex items-center justify-center space-x-2 bg-alpha text-dark px-6 py-4 rounded-xl hover:bg-alpha/90 transition-colors font-bold text-lg"
                                    >
                                        <Eye size={20} />
                                        <span>Show Question Results</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleNextQuestion}
                                        className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-light px-6 py-4 rounded-xl hover:bg-blue-600 transition-colors font-bold text-lg"
                                    >
                                        <SkipForward size={20} />
                                        <span>Next Question</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleCompleteGame}
                                        className="w-full flex items-center justify-center space-x-2 border border-purple-300 text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-semibold"
                                    >
                                        <Trophy size={16} />
                                        <span>Complete Game</span>
                                    </button>
                                </>
                            )}

                            {(session.status === 'waiting' || session.status === 'in_progress') && (
                                <button
                                    onClick={handleCancelGame}
                                    className="w-full flex items-center justify-center space-x-2 border border-error text-error px-6 py-3 rounded-xl hover:bg-error/10 transition-colors font-semibold"
                                >
                                    <StopCircle size={16} />
                                    <span>Cancel Game</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Live Leaderboard */}
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Live Leaderboard</h2>
                        
                        {leaderboard && leaderboard.length > 0 ? (
                            <div className="space-y-3">
                                {leaderboard.slice(0, 10).map((participant, index) => (
                                    <div key={participant.id} className="flex items-center justify-between p-3 bg-alpha/5 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0 ? 'bg-good text-light' :
                                                index === 1 ? 'bg-gray-400 text-light' :
                                                index === 2 ? 'bg-amber-600 text-light' :
                                                'bg-alpha text-dark'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-dark dark:text-light">
                                                    {participant.nickname || participant.user?.name}
                                                </p>
                                                <p className="text-xs text-dark/60 dark:text-light/60">
                                                    {participant.correct_answers}/{participant.correct_answers + participant.wrong_answers} correct
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-alpha">{participant.total_score}</p>
                                            <button
                                                onClick={() => handleRemoveParticipant(participant.id)}
                                                className="text-xs text-error hover:text-error/80"
                                            >
                                                <UserMinus size={12} className="inline mr-1" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="mx-auto text-alpha/60 mb-4" size={48} />
                                <p className="text-dark/60 dark:text-light/60">
                                    No participants yet. Share the game PIN!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                {session.status === 'waiting' && (
                    <div className="mt-8 bg-alpha/10 border border-alpha/20 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-dark dark:text-light mb-4">
                            📋 Instructions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark/70 dark:text-light/70">
                            <div className="flex items-start space-x-3">
                                <span className="text-alpha font-bold">1.</span>
                                <span>Share the game PIN <strong>{session.session_code}</strong> with your students</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-alpha font-bold">2.</span>
                                <span>Students join at <strong>/geeko/join</strong> using the PIN</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-alpha font-bold">3.</span>
                                <span>Wait for students to join and click "Start Game"</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-alpha font-bold">4.</span>
                                <span>Control the pace of questions and view live results</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
