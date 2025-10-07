import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Play, StopCircle, Users, ArrowLeft, RefreshCw, Share2, Check, SkipForward } from 'lucide-react';

export default function SessionControl({ session, formationId, geekoId }) {
    const [liveData, setLiveData] = useState({
        participants_count: session.participants?.length || 0,
        participants: session.participants || [],
        session_status: session.status,
        current_question: null,
    });
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [copiedPin, setCopiedPin] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [frozenLeaderboard, setFrozenLeaderboard] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [questionEnded, setQuestionEnded] = useState(false);
    const [showEndAlerts, setShowEndAlerts] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const lastQuestionIdRef = useRef(null);

    // Poll for live updates
    useEffect(() => {
        if (!autoRefresh) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/live-data`);
                const data = await response.json();
                const inProgress = (data.session?.status || session.status) === 'in_progress';
                setLiveData({
                    participants_count: data.participants_count,
                    participants: data.session?.participants || [],
                    session_status: data.session?.status || session.status,
                    current_question: data.current_question || null,
                    should_end_question: data.should_end_question || false,
                    option_counts: data.option_counts || [],
                    current_answer_count: data.current_answer_count || 0,
                });

                // Reset end alerts and leaderboard toggle when question changes
                const currentQuestionId = data.current_question ? data.current_question.id : null;
                if (currentQuestionId !== lastQuestionIdRef.current) {
                    lastQuestionIdRef.current = currentQuestionId;
                    setShowEndAlerts(false);
                    setShowLeaderboard(false);
                }

                // Timer calculation: derive time left using server timestamps
                if (inProgress && data.current_question && (data.session?.current_question_started_at || data.current_question_started_at)) {
                    const startedAt = new Date(data.session?.current_question_started_at || data.current_question_started_at);
                    const limit = data.current_question.time_limit ?? data.session?.geeko?.time_limit;
                    if (limit != null) {
                        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
                        let remaining = Math.max(0, limit - elapsed);
                        // If server indicates all answered, force timer to 0 immediately
                if (data.should_end_question) {
                            remaining = 0;
                        }
                        setTimeLeft(remaining);
                        const allAnswered = (data.current_answer_count || 0) >= (data.participants_count || 0) && (data.participants_count || 0) > 0;
                        const ended = remaining === 0 || !!data.should_end_question || allAnswered;
                        setQuestionEnded(ended);
                        if (ended) {
                            if (!showEndAlerts) setShowEndAlerts(true);
                        }
                    } else {
                        setTimeLeft(null);
                        const allAnswered = (data.current_answer_count || 0) >= (data.participants_count || 0) && (data.participants_count || 0) > 0;
                        const ended = !!data.should_end_question || allAnswered;
                        setQuestionEnded(ended);
                        if (ended) {
                            if (!showEndAlerts) setShowEndAlerts(true);
                        }
                    }
                } else {
                    setTimeLeft(null);
                    setQuestionEnded(false);
                }
            } catch (error) {
                console.error('Failed to fetch live data:', error);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [autoRefresh, formationId, geekoId, session.id]);

    const handleStartGame = () => {
        runCountdownThen(5, () => {
        router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/start`);
        });
    };

    const handleNextQuestion = () => {
        runCountdownThen(5, () => {
            router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/next-question`);
        });
    };

    const handleCancelGame = () => {
        if (confirm('Stop and cancel this game?')) {
            router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/cancel`);
        }
    };

    const copyGamePin = async () => {
        try {
            await navigator.clipboard.writeText(session.session_code);
            setCopiedPin(true);
            setTimeout(() => setCopiedPin(false), 1500);
        } catch (e) {}
    };

    const copyGameLink = async () => {
        try {
        const link = `${window.location.origin}/geeko/${session.session_code}`;
            await navigator.clipboard.writeText(link);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 1500);
        } catch (e) {}
    };

    const refreshLeaderboardOnce = async () => {
        try {
            const response = await fetch(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/live-data`);
            const data = await response.json();
            if (Array.isArray(data.leaderboard)) {
                setFrozenLeaderboard(data.leaderboard);
            }
        } catch (e) {}
    };

    // Countdown helper to show overlay and execute action after N seconds
    const runCountdownThen = (seconds, action) => {
        setShowCountdown(true);
        setCountdown(seconds);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowCountdown(false);
                    action?.();
                }
                return prev - 1;
            });
        }, 1000);
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
                {liveData.session_status !== 'in_progress' && (
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
                            
                            <div className="flex items-center space-x-3 text-xs text-dark/60 dark:text-light/60">
                                <span className={`px-2 py-1 rounded-md ${session.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                        session.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                                            session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {getStatusText(session.status)}
                                </span>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`p-2 rounded-md ${autoRefresh ? 'bg-good text-light' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    title={autoRefresh ? 'Auto-refresh enabled' : 'Enable auto-refresh'}
                                >
                                    <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>
                        <div className="pb-3">
                            <h1 className="text-lg font-medium text-dark dark:text-light">{session.geeko.title}</h1>
                            <div className="text-xs text-dark/50 dark:text-light/50">{liveData.participants_count} participants</div>
                        </div>
                    </div>
                </div>
                )}

                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* PIN + Share */}
                    <div className="bg-white dark:bg-dark border border-alpha/10 rounded-xl p-5 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button onClick={copyGamePin} className="text-3xl font-extrabold tracking-widest text-alpha cursor-pointer select-none">
                                    {session.session_code}
                                </button>
                                {copiedPin && (
                                    <span className="inline-flex items-center gap-1 text-good text-xs font-semibold">
                                        <Check size={12} /> Copied
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={copyGamePin}
                                    className="inline-flex items-center gap-1 bg-alpha text-dark px-3 py-2 rounded-md hover:bg-alpha/90 text-xs font-semibold"
                                >
                                    <Share2 size={12} />
                                    <span>Copy PIN</span>
                                </button>
                                <button
                                    onClick={copyGameLink}
                                    className="inline-flex items-center gap-1 border border-alpha/30 text-dark dark:text-light px-3 py-2 rounded-md hover:bg-alpha/10 text-xs font-semibold"
                                >
                                    <Share2 size={12} />
                                    <span>Copy Link</span>
                                </button>
                                {copiedLink && (
                                    <span className="inline-flex items-center gap-1 text-good text-xs font-semibold">
                                        <Check size={12} /> Copied
                                    </span>
                                )}
                                <div className="flex flex-wrap gap-3">
                                    {session.status === 'waiting' && (
                                        <button
                                            onClick={handleStartGame}
                                            className="inline-flex items-center gap-2 bg-good text-light px-5 py-2 rounded-lg hover:bg-good/90 font-semibold"
                                        >
                                            <Play size={16} />
                                            <span>Start</span>
                                        </button>
                                    )}
                                    {(session.status === 'waiting' || session.status === 'in_progress') && (
                                        <button
                                            onClick={handleCancelGame}
                                            className="inline-flex items-center gap-2 border border-error/30 text-error px-5 py-2 rounded-lg hover:bg-error/10 font-semibold"
                                        >
                                            <StopCircle size={16} />
                                            <span>Stop</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Question (TV view) */}
                    {liveData.session_status === 'in_progress' && liveData.current_question && !showLeaderboard && (
                        <div className="bg-white dark:bg-dark border border-alpha/10 rounded-xl p-8 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm text-dark/60 dark:text-light/60">Question</div>
                                <div className="flex items-center gap-2">
                                    {timeLeft !== null && !questionEnded && (
                                        <div className={`text-sm font-semibold px-3 py-1 rounded-md ${timeLeft <= 5 ? 'bg-error/10 text-error' : 'bg-alpha/10 text-alpha'}`}>
                                            {timeLeft}s
                                        </div>
                                    )}
                                    <div className="text-xs font-semibold px-2 py-1 rounded-md bg-alpha/10 text-alpha">
                                        {liveData.current_answer_count}/{liveData.participants_count}
                                    </div>
                                </div>
                            </div>
                            {questionEnded && (
                                <div className="mb-4 flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 rounded-md bg-good/10 text-good font-semibold">Done</span>
                                    <button onClick={async () => {
                                        setShowLeaderboard(true);
                                        // wait 2s then refresh and animate scores
                                        setTimeout(async () => {
                                            try {
                                                const data = await fetch(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/live-data`).then(r => r.json());
                                                if (Array.isArray(data.leaderboard)) {
                                                    // set initial 0 scores for animation
                                                    const initial = {};
                                                    data.leaderboard.forEach(p => { initial[p.id] = 0; });
                                                    // animate to target scores
                                                    const targets = {};
                                                    data.leaderboard.forEach(p => { targets[p.id] = p.total_score || 0; });
                                                    setFrozenLeaderboard(data.leaderboard);
                                                    const duration = 1000;
                                                    const start = performance.now();
                                                    const step = (t) => {
                                                        const progress = Math.min(1, (t - start) / duration);
                                                        const current = {};
                                                        Object.keys(targets).forEach(id => {
                                                            current[id] = Math.round(targets[id] * progress);
                                                        });
                                                        // store animated values on each row as a prop-like map
                                                        window.__animatedScores = current;
                                                        if (progress < 1) requestAnimationFrame(step);
                                                        else window.__animatedScores = targets;
                                                    };
                                                    requestAnimationFrame(step);
                                                }
                                            } catch(e) {}
                                        }, 2000);
                                    }} className="px-2 py-1 rounded-md border border-alpha/30 hover:bg-alpha/10">Show leaderboard</button>
                                </div>
                            )}
                            <div className="text-4xl md:text-5xl font-extrabold text-dark dark:text-light mb-6 leading-tight">
                                {liveData.current_question.question}
                            </div>
                            {Array.isArray(liveData.current_question.options) && !showLeaderboard && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {liveData.current_question.options.map((opt, idx) => {
      // 🎨 Harmonized color palette — no alpha, visually balanced
      const palette = [
        'bg-alpha/5 border-amber-300/60',
      ];
      const baseColor = palette[idx % palette.length];

      const correctAnswers = liveData.current_question.correct_answers;
      const isCorrect =
        Array.isArray(correctAnswers) &&
        (correctAnswers.includes(idx) ||
          correctAnswers.includes(opt) ||
          correctAnswers.includes(String(opt)));

      // ✅ Visual logic:
      // - Before end → soft colored background
      // - After end → highlight correct, fade wrong
      const endedClass = questionEnded
        ? isCorrect
          ? 'bg-alpha border-alpha text-black ring-2 ring-alpha' // ✅ full alpha highlight, black text for contrast
          : 'opacity-50'
        : '';

      const count = Array.isArray(liveData.option_counts)
        ? (liveData.option_counts[idx] || 0)
        : 0;
      const showCount = questionEnded;

      return (
        <div
          key={idx}
          className={`p-5 rounded-2xl border text-dark dark:text-light text-lg md:text-xl font-semibold transition-all duration-300
            ${questionEnded ? endedClass : baseColor}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`mr-2 font-bold ${isCorrect && questionEnded ? 'text-black' : 'text-alpha'}`}>
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className={`${isCorrect && questionEnded ? 'text-black' : ''}`}>
                {typeof opt === 'string' ? opt : JSON.stringify(opt)}
              </span>
            </div>
            {showCount && (
              <span
                className={`text-sm font-bold ${
                  isCorrect && questionEnded ? 'text-black' : 'text-dark/60 dark:text-light/60'
                }`}
              >
                {count}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
)}

{questionEnded && !showLeaderboard && (
  <div className="mt-4 text-sm text-dark/60 dark:text-light/60">
    <span className="font-semibold">Correct answer: </span>
    {Array.isArray(liveData.current_question.correct_answers)
      ? liveData.current_question.correct_answers.join(', ')
      : String(liveData.current_question.correct_answers ?? '')}
  </div>
)}

                        </div>
                    )}



                    {/* Participants / Leaderboard Panel */}
                    {liveData.session_status !== 'in_progress' ? (
                        <div className="bg-white dark:bg-dark border border-alpha/10 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-dark dark:text-light flex items-center gap-2">
                                    <Users size={16} className="text-alpha" /> Participants
                                    <span className="text-xs text-dark/50 dark:text-light/50">({liveData.participants_count})</span>
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-dark/50 dark:text-light/50">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live</span>
                            </div>
                        </div>
                        
                            {liveData.participants && liveData.participants.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {liveData.participants.map((p) => (
                                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-alpha/5 hover:bg-alpha/10 transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-alpha text-dark flex items-center justify-center font-bold">
                                                {(p.nickname || p.user?.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-dark dark:text-light truncate">
                                                    {p.nickname || p.user?.name}
                                                </div>
                                                <div className="text-[11px] text-dark/50 dark:text-light/50">ready</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="mx-auto text-alpha/40 mb-2" size={28} />
                                    <p className="text-sm text-dark/60 dark:text-light/60">No participants yet. Share the PIN!</p>
                                </div>
                            )}
                        </div>
                    ) : showLeaderboard ? (
                        <div className="bg-white dark:bg-dark border border-alpha/10 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-dark dark:text-light">Leaderboard</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={refreshLeaderboardOnce} className={`text-xs border px-3 py-1.5 rounded-md hover:bg-alpha/10 border-alpha/30`}>Refresh</button>
                                    {questionEnded && (
                                        <button onClick={handleNextQuestion} className="text-xs inline-flex items-center gap-1 bg-blue-500 text-light px-3 py-1.5 rounded-md hover:bg-blue-600">
                                            <SkipForward size={12} /> Next
                                            </button>
                                    )}
                                </div>
                            </div>
                            {questionEnded && frozenLeaderboard && frozenLeaderboard.length > 0 ? (
                                <div className="space-y-2">
                                    {frozenLeaderboard.slice(0, 10).map((p, idx) => (
                                        <div key={p.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-dark/60 border border-alpha/10 transition-all duration-500" style={{ transform: 'translateY(0)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${idx===0?'bg-yellow-300 text-yellow-900':idx===1?'bg-gray-300 text-gray-800':idx===2?'bg-amber-500 text-amber-900':'bg-alpha/20 text-alpha'}`}>{idx+1}</div>
                                                <div className="text-sm font-semibold text-dark dark:text-light">{p.nickname || p.user?.name}</div>
                                        </div>
                                            <div className="text-base font-extrabold text-alpha tabular-nums">{(window.__animatedScores && window.__animatedScores[p.id] !== undefined) ? window.__animatedScores[p.id] : p.total_score}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                                <div className="text-center py-8 text-sm text-dark/60 dark:text-light/60">Leaderboard will appear when time is up</div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Countdown Overlay */}
                {showCountdown && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm"></div>
                        <div className="relative z-10 select-none">
                            <div className="text-8xl md:text-9xl font-extrabold text-light drop-shadow-xl">
                                {Math.max(countdown, 1)}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
