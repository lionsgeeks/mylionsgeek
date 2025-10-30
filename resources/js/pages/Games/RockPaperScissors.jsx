import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const CHOICES = [
    { id: 'rock', label: '✊ Rock' },
    { id: 'paper', label: '✋ Paper' },
    { id: 'scissors', label: '✌️ Scissors' },
];

const beats = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
};

export default function RockPaperScissors() {
    const [rounds, setRounds] = useState(3);
    const [currentRound, setCurrentRound] = useState(1);
    const [p1Choice, setP1Choice] = useState(null);
    const [p2Choice, setP2Choice] = useState(null);
    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [step, setStep] = useState('p1'); // p1 -> p2 -> reveal

    const resetMatch = () => {
        setRoundDefaults();
        setScores({ p1: 0, p2: 0 });
        setCurrentRound(1);
    };

    const setRoundDefaults = () => {
        setP1Choice(null);
        setP2Choice(null);
        setStep('p1');
    };

    const nextRound = () => {
        if (currentRound < rounds) {
            setCurrentRound((prev) => prev + 1);
            setRoundDefaults();
        }
    };

    const decideWinner = () => {
        if (!p1Choice || !p2Choice) return 'pending';
        if (p1Choice === p2Choice) return 'tie';
        return beats[p1Choice] === p2Choice ? 'p1' : 'p2';
    };

    const onPick = (player, choice) => {
        if (player === 'p1') {
            setP1Choice(choice);
            setStep('p2');
        } else if (player === 'p2') {
            setP2Choice(choice);
            setStep('reveal');
            const winner = beats[choice] === p1Choice ? 'p1' : beats[p1Choice] === choice ? 'p2' : 'tie';
            if (winner === 'p1') setScores((prev) => ({ ...prev, p1: prev.p1 + 1 }));
            if (winner === 'p2') setScores((prev) => ({ ...prev, p2: prev.p2 + 1 }));
        }
    };

    const matchOver = currentRound === rounds && step === 'reveal';
    const overallWinner = scores.p1 === scores.p2 ? 'tie' : scores.p1 > scores.p2 ? 'p1' : 'p2';

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Link href="/games" className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Games
                        </Link>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">✊✋✌️ Rock Paper Scissors</h1>
                        <p className="text-gray-600">Two players. Best of rounds with pass-and-play.</p>
                    </div>

                    {/* Rounds selector */}
                    <div className="mb-6 flex justify-center gap-3">
                        {[3, 5, 7].map((n) => (
                            <button
                                key={n}
                                onClick={() => {
                                    setRounds(n);
                                    resetMatch();
                                }}
                                className={`rounded-md px-4 py-2 ${rounds === n ? 'bg-gray-800 text-white' : 'border bg-white text-gray-700'}`}
                            >
                                Best of {n}
                            </button>
                        ))}
                    </div>

                    {/* Scoreboard */}
                    <div className="mb-6 flex justify-center gap-8">
                        <div className="rounded-lg bg-white p-4 text-center shadow-md">
                            <div className="text-xl font-bold">Player 1</div>
                            <div className="text-3xl font-extrabold text-blue-600">{scores.p1}</div>
                        </div>
                        <div className="rounded-lg bg-white p-4 text-center shadow-md">
                            <div className="text-xl font-bold">Player 2</div>
                            <div className="text-3xl font-extrabold text-rose-600">{scores.p2}</div>
                        </div>
                    </div>

                    <div className="mb-2 text-center text-sm text-gray-600">
                        Round {currentRound} of {rounds}
                    </div>

                    {/* Step panels */}
                    {step === 'p1' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg">
                            <div className="mb-3 font-semibold">Player 1: Choose</div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map((ch) => (
                                    <button key={ch.id} onClick={() => onPick('p1', ch.id)} className="rounded-lg border px-4 py-3 hover:bg-gray-50">
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'p2' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg">
                            <div className="mb-3 font-semibold">Player 2: Choose</div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map((ch) => (
                                    <button key={ch.id} onClick={() => onPick('p2', ch.id)} className="rounded-lg border px-4 py-3 hover:bg-gray-50">
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'reveal' && (
                        <div className="rounded-2xl border bg-white p-6 text-center shadow-lg">
                            <div className="mb-4">
                                <div className="text-lg">
                                    Player 1 picked: <strong>{p1Choice}</strong>
                                </div>
                                <div className="text-lg">
                                    Player 2 picked: <strong>{p2Choice}</strong>
                                </div>
                            </div>
                            {(() => {
                                const w = decideWinner();
                                if (w === 'tie') return <div className="text-xl font-bold text-gray-700">Tie! 🤝</div>;
                                if (w === 'p1') return <div className="text-xl font-bold text-blue-700">Player 1 wins this round! 🎉</div>;
                                if (w === 'p2') return <div className="text-xl font-bold text-rose-700">Player 2 wins this round! 🎉</div>;
                                return null;
                            })()}

                            <div className="mt-6 flex justify-center gap-3">
                                {!matchOver && (
                                    <button onClick={nextRound} className="rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white hover:bg-black">
                                        Next Round
                                    </button>
                                )}
                                {matchOver && (
                                    <button onClick={resetMatch} className="rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white hover:bg-black">
                                        New Match
                                    </button>
                                )}
                            </div>

                            {matchOver && (
                                <div className="mt-4 text-lg">
                                    {overallWinner === 'tie'
                                        ? 'Match tied.'
                                        : overallWinner === 'p1'
                                          ? 'Player 1 wins the match!'
                                          : 'Player 2 wins the match!'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
