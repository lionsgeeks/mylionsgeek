import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { 
    Trophy, Users, Clock, Target, ArrowLeft, Download, 
    CheckCircle, XCircle, TrendingUp, BarChart3
} from 'lucide-react';

export default function SessionResults({ session, leaderboard, questionStats, formationId, geekoId }) {
    const [activeTab, setActiveTab] = useState('leaderboard');

    const handleBackToControl = () => {
        router.visit(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/control`);
    };

    const handleBackToGeeko = () => {
        router.visit(`/training/${formationId}/geeko/${geekoId}`);
    };

    const exportResults = () => {
        // TODO: Implement CSV export
        //alert('Export functionality coming soon!');
    };

    const calculateSessionStats = () => {
        const totalQuestions = session.geeko.questions?.length || 0;
        const totalParticipants = leaderboard.length;
        const totalAnswers = leaderboard.reduce((sum, p) => sum + p.correct_answers + p.wrong_answers, 0);
        const totalCorrect = leaderboard.reduce((sum, p) => sum + p.correct_answers, 0);
        const avgScore = totalParticipants > 0 ? leaderboard.reduce((sum, p) => sum + p.total_score, 0) / totalParticipants : 0;
        const avgAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;

        return {
            totalQuestions,
            totalParticipants,
            avgScore: Math.round(avgScore),
            avgAccuracy: Math.round(avgAccuracy * 10) / 10,
            completionRate: totalParticipants > 0 ? Math.round((leaderboard.filter(p => p.correct_answers + p.wrong_answers > 0).length / totalParticipants) * 100) : 0
        };
    };

    const stats = calculateSessionStats();

    const formatDuration = (start, end) => {
        if (!start || !end) return 'N/A';
        const duration = new Date(end) - new Date(start);
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '1st';
        if (rank === 2) return '2nd';
        if (rank === 3) return '3rd';
        return `#${rank}`;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-amber-600';
        return 'text-alpha';
    };

    return (
        <AppLayout>
            <Head title={`Results - ${session.geeko.title}`} />

            <div className="min-h-screen p-6 bg-light dark:bg-dark">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button 
                            onClick={handleBackToControl}
                            className="flex items-center space-x-2 text-alpha hover:text-alpha/80 font-semibold"
                        >
                            <ArrowLeft size={20} />
                            <span>Control Panel</span>
                        </button>
                        <span className="text-dark/40 dark:text-light/40">|</span>
                        <button 
                            onClick={handleBackToGeeko}
                            className="text-alpha hover:text-alpha/80 font-semibold"
                        >
                            Back to Geeko
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-dark dark:text-light">
                                Session Results
                            </h1>
                            <p className="mt-2 text-dark/70 dark:text-light/70">
                                {session.geeko.title} - Completed {session.ended_at ? new Date(session.ended_at).toLocaleDateString() : 'Recently'}
                            </p>
                        </div>
                        
                        <button
                            onClick={exportResults}
                            className="flex items-center space-x-2 border border-alpha/30 text-dark dark:text-light px-4 py-2 rounded-lg hover:bg-alpha/10 transition-colors"
                        >
                            <Download size={16} />
                            <span>Export Results</span>
                        </button>
                    </div>
                </div>

                {/* Session Overview */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 mb-8 shadow-xl">
                    <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Session Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-alpha mb-2">{stats.totalParticipants}</div>
                            <div className="text-dark/70 dark:text-light/70 text-sm">Participants</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.avgScore}</div>
                            <div className="text-dark/70 dark:text-light/70 text-sm">Avg Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-good mb-2">{stats.avgAccuracy}%</div>
                            <div className="text-dark/70 dark:text-light/70 text-sm">Avg Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-500 mb-2">{stats.completionRate}%</div>
                            <div className="text-dark/70 dark:text-light/70 text-sm">Completion</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-500 mb-2">
                                {formatDuration(session.started_at, session.ended_at)}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 text-sm">Duration</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-alpha/20">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                                    activeTab === 'leaderboard'
                                        ? 'border-alpha text-alpha'
                                        : 'border-transparent text-dark/70 dark:text-light/70 hover:text-alpha'
                                }`}
                            >
                                <Trophy size={16} className="inline mr-2" />
                                Leaderboard
                            </button>
                            <button
                                onClick={() => setActiveTab('questions')}
                                className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                                    activeTab === 'questions'
                                        ? 'border-alpha text-alpha'
                                        : 'border-transparent text-dark/70 dark:text-light/70 hover:text-alpha'
                                }`}
                            >
                                <BarChart3 size={16} className="inline mr-2" />
                                Question Analysis
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'leaderboard' && (
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-dark dark:text-light mb-6">Final Leaderboard</h3>
                        
                        {leaderboard.length > 0 ? (
                            <div className="space-y-4">
                                {leaderboard.map((participant, index) => (
                                    <div key={participant.id} className={`p-6 rounded-xl border transition-all ${
                                        index < 3 
                                            ? 'border-alpha/40 bg-alpha/5' 
                                            : 'border-alpha/20 bg-alpha/2'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`text-2xl font-bold ${getRankColor(index + 1)}`}>
                                                    {getRankBadge(index + 1)}
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-full bg-alpha text-dark flex items-center justify-center font-bold text-lg">
                                                        {(participant.nickname || participant.user?.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark dark:text-light text-lg">
                                                            {participant.nickname || participant.user?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-dark/60 dark:text-light/60 text-sm">
                                                            {participant.user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-alpha mb-1">
                                                    {participant.total_score}
                                                </div>
                                                <div className="text-sm text-dark/70 dark:text-light/70">
                                                    {participant.correct_answers}/{participant.correct_answers + participant.wrong_answers} correct
                                                </div>
                                                <div className="text-xs text-dark/60 dark:text-light/60">
                                                    {participant.correct_answers + participant.wrong_answers > 0 
                                                        ? Math.round((participant.correct_answers / (participant.correct_answers + participant.wrong_answers)) * 100)
                                                        : 0}% accuracy
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-dark/60 dark:text-light/60 mb-2">
                                                <span>Question Progress</span>
                                                <span>{participant.correct_answers + participant.wrong_answers}/{stats.totalQuestions}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-alpha h-2 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${((participant.correct_answers + participant.wrong_answers) / stats.totalQuestions) * 100}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="mx-auto text-alpha/60 mb-4" size={48} />
                                <p className="text-dark/60 dark:text-light/60">No participants in this session</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        {questionStats.map((stat, index) => (
                            <div key={stat.question.id} className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-dark dark:text-light mb-2">
                                            Question {index + 1}
                                        </h3>
                                        <p className="text-dark/70 dark:text-light/70 line-clamp-2">
                                            {stat.question.question}
                                        </p>
                                    </div>
                                    <div className="text-right ml-6">
                                        <div className="text-2xl font-bold text-alpha mb-1">
                                            {Math.round(stat.accuracy)}%
                                        </div>
                                        <div className="text-sm text-dark/60 dark:text-light/60">
                                            Accuracy
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Correct Answers */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <CheckCircle className="text-good" size={20} />
                                            <span className="text-lg font-bold text-good">{stat.correct_count}</span>
                                        </div>
                                        <div className="text-dark/70 dark:text-light/70 text-sm">Correct</div>
                                    </div>

                                    {/* Wrong Answers */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <XCircle className="text-error" size={20} />
                                            <span className="text-lg font-bold text-error">{stat.wrong_count}</span>
                                        </div>
                                        <div className="text-dark/70 dark:text-light/70 text-sm">Incorrect</div>
                                    </div>

                                    {/* Total Responses */}
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <Users className="text-blue-500" size={20} />
                                            <span className="text-lg font-bold text-blue-500">
                                                {stat.correct_count + stat.wrong_count}
                                            </span>
                                        </div>
                                        <div className="text-dark/70 dark:text-light/70 text-sm">Total Responses</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-6">
                                    <div className="flex space-x-1 h-4 rounded-full overflow-hidden bg-gray-200">
                                        <div 
                                            className="bg-good transition-all"
                                            style={{ 
                                                width: `${stat.correct_count + stat.wrong_count > 0 ? (stat.correct_count / (stat.correct_count + stat.wrong_count)) * 100 : 0}%` 
                                            }}
                                        ></div>
                                        <div 
                                            className="bg-error transition-all"
                                            style={{ 
                                                width: `${stat.correct_count + stat.wrong_count > 0 ? (stat.wrong_count / (stat.correct_count + stat.wrong_count)) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Question Details */}
                                <div className="mt-4 pt-4 border-t border-alpha/20">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-dark/60 dark:text-light/60">Type:</span>
                                            <span className="ml-2 font-semibold text-dark dark:text-light">
                                                {stat.question.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-dark/60 dark:text-light/60">Points:</span>
                                            <span className="ml-2 font-semibold text-dark dark:text-light">
                                                {stat.question.points}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-dark/60 dark:text-light/60">Time Limit:</span>
                                            <span className="ml-2 font-semibold text-dark dark:text-light">
                                                {stat.question.time_limit || session.geeko.time_limit}s
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-dark/60 dark:text-light/60">Difficulty:</span>
                                            <span className="ml-2 font-semibold text-dark dark:text-light">
                                                {stat.accuracy > 80 ? 'Easy' : stat.accuracy > 50 ? 'Medium' : 'Hard'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

