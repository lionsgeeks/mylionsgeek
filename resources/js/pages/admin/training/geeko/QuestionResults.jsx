import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Trophy, SkipForward, Users } from 'lucide-react';

export default function QuestionResults({ session, question, answers = [], formationId, geekoId }) {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await fetch(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/live-data`);
                const data = await res.json();
                if (active) setLeaderboard(data.leaderboard || []);
            } catch {}
        };
        load();
        const id = setInterval(load, 2000);
        return () => { active = false; clearInterval(id); };
    }, [formationId, geekoId, session.id]);

    const handleNext = () => {
        router.post(`/training/${formationId}/geeko/${geekoId}/session/${session.id}/next-question`);
    };

    const top = leaderboard.slice(0, 10);

    return (
        <AppLayout>
            <Head title="Round Results" />
            <div className="min-h-screen p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-extrabold text-dark dark:text-light">Round Results</h1>
                        <button onClick={handleNext} className="inline-flex items-center gap-2 bg-alpha text-dark font-semibold px-4 py-2 rounded-lg">
                            <span>Next</span>
                            <SkipForward size={16} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Question and options only (no ranks here) */}
                        <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 md:col-span-2">
                            <h2 className="text-lg font-bold text-dark dark:text-light mb-4">Question</h2>
                            <div className="text-dark dark:text-light font-semibold mb-2">{question.question}</div>
                            <div className="text-xs uppercase tracking-wider text-dark/60 dark:text-light/60 mb-4">{question.type.replace('_',' ')}</div>

                            {/* Options list */}
                            {Array.isArray(question.options) ? (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {question.options.map((opt, idx) => (
                                        <div key={idx} className="px-4 py-3 rounded-xl border border-white/20 bg-white/40 dark:bg-dark/40 text-dark dark:text-light">
                                            <span className="font-semibold mr-2">{String.fromCharCode(65+idx)}.</span> {opt}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-dark/60 dark:text-light/60">No options</div>
                            )}

                            {/* Answers summary */}
                            <div className="mt-6">
                                <div className="text-sm text-dark/60 dark:text-light/60 flex items-center gap-2"><Users size={16}/> {answers.length} answers</div>
                                <div className="mt-3 space-y-2 max-h-[260px] overflow-auto pr-2">
                                    {answers.map((a, i) => (
                                        <div key={i} className="flex items-center justify-between border border-white/20 rounded-lg p-3 bg-white/40 dark:bg-dark/40">
                                            <div className="text-sm text-dark dark:text-light">{a.user?.name}</div>
                                            <div className={`text-sm font-bold ${a.is_correct?'text-good':'text-error'}`}>{a.is_correct?'+':''}{a.points_earned} pts</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


