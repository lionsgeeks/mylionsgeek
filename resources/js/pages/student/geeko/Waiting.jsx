import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Trophy, Medal, ArrowRight } from 'lucide-react';

export default function GeekoWaiting({ session, participant, leaderboard = [] }) {
    const [liveData, setLiveData] = useState({
        session_status: session.status,
        current_question_index: session.current_question_index,
        total_questions: session.geeko?.questions?.length || 0,
        leaderboard: leaderboard,
    });

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/geeko/play/${session.id}/live-data`);
                const data = await res.json();
                setLiveData(prev => ({ ...prev, ...data }));

                if (data.session_status === 'in_progress' && data.current_question_index !== session.current_question_index) {
                    router.visit(`/geeko/play/${session.id}/question`);
                }
                if (data.session_status === 'completed') {
                    router.visit(`/geeko/play/${session.id}/completed`);
                }
            } catch (e) {
                // silent
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [session.id, session.current_question_index]);

    const top = (liveData.leaderboard || []).slice(0, 10);

    return (
        <AppLayout>
            <Head title="Between Rounds" />
            <div className="min-h-screen bg-gradient-to-b from-alpha/5 to-transparent dark:from-alpha/10 dark:to-transparent p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-dark dark:text-light mb-2">
                        Round Results
                    </h1>
                    <p className="text-dark/60 dark:text-light/60 mb-8">
                        Waiting for the instructor to move to the next question...
                    </p>

                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-left">
                                <div className="text-sm text-dark/60 dark:text-light/60">Progress</div>
                                <div className="text-lg font-semibold text-dark dark:text-light">
                                    Q{liveData.current_question_index + 1}/{liveData.total_questions}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-dark/60 dark:text-light/60">Players</div>
                                <div className="text-lg font-semibold text-dark dark:text-light">
                                    {(liveData.participants_count) ?? '-'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {top.length === 0 ? (
                                <div className="py-8 text-dark/60 dark:text-light/60">Waiting for scores...</div>
                            ) : (
                                top.map((p, idx) => (
                                    <div
                                        key={p.id || idx}
                                        className={`flex items-center justify-between rounded-xl border transition-all duration-300 ${idx === 0 ? 'bg-alpha/30 border-alpha/40 shadow-md scale-[1.01]' : 'bg-white/50 dark:bg-dark/40 border-white/20'} p-4 animate-[fadeIn_400ms_ease]`}
                                        style={{ animationDelay: `${idx * 70}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${idx === 0 ? 'bg-alpha text-dark' : 'bg-white/70 dark:bg-dark/60 text-dark/80 dark:text-light/80'}`}>
                                                {idx === 0 ? <Trophy size={20} /> : idx === 1 ? <Medal size={20} /> : idx === 2 ? <Medal size={20} /> : <span className="font-bold">{idx + 1}</span>}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold text-dark dark:text-light">{p.user?.name || p.nickname}</div>
                                                <div className="text-xs text-dark/60 dark:text-light/60">Correct: {p.correct_answers} • Wrong: {p.wrong_answers}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-extrabold text-dark dark:text-light">{p.total_score}</div>
                                            <div className="text-xs text-dark/60 dark:text-light/60">points</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 text-dark/60 dark:text-light/60 flex items-center justify-center gap-2">
                            <span>Next question will start soon</span>
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


