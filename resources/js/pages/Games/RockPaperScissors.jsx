import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
            setCurrentRound(prev => prev + 1);
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
            const winner = beats[choice] === p1Choice ? 'p1' : (beats[p1Choice] === choice ? 'p2' : 'tie');
            if (winner === 'p1') setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            if (winner === 'p2') setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
        }
    };

    const matchOver = currentRound === rounds && step === 'reveal';
    const overallWinner = scores.p1 === scores.p2 ? 'tie' : (scores.p1 > scores.p2 ? 'p1' : 'p2');

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <Link href="/games" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">← Back to Games</Link>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">✊✋✌️ Rock Paper Scissors</h1>
                        <p className="text-gray-600">Two players. Best of rounds with pass-and-play.</p>
                    </div>

                    {/* Rounds selector */}
                    <div className="flex justify-center mb-6 gap-3">
                        {[3, 5, 7].map(n => (
                            <button key={n} onClick={() => { setRounds(n); resetMatch(); }}
                                className={`px-4 py-2 rounded-md ${rounds === n ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border'}`}>Best of {n}</button>
                        ))}
                    </div>

                    {/* Scoreboard */}
                    <div className="flex justify-center gap-8 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-4 text-center">
                            <div className="text-xl font-bold">Player 1</div>
                            <div className="text-3xl font-extrabold text-blue-600">{scores.p1}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4 text-center">
                            <div className="text-xl font-bold">Player 2</div>
                            <div className="text-3xl font-extrabold text-rose-600">{scores.p2}</div>
                        </div>
                    </div>

                    <div className="text-center mb-2 text-sm text-gray-600">Round {currentRound} of {rounds}</div>

                    {/* Step panels */}
                    {step === 'p1' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
                            <div className="font-semibold mb-3">Player 1: Choose</div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map(ch => (
                                    <button key={ch.id} onClick={() => onPick('p1', ch.id)} className="px-4 py-3 rounded-lg border hover:bg-gray-50">
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'p2' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
                            <div className="font-semibold mb-3">Player 2: Choose</div>
                            <div className="flex justify-center gap-4">
                                {CHOICES.map(ch => (
                                    <button key={ch.id} onClick={() => onPick('p2', ch.id)} className="px-4 py-3 rounded-lg border hover:bg-gray-50">
                                        {ch.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'reveal' && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border text-center">
                            <div className="mb-4">
                                <div className="text-lg">Player 1 picked: <strong>{p1Choice}</strong></div>
                                <div className="text-lg">Player 2 picked: <strong>{p2Choice}</strong></div>
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
                                    <button onClick={nextRound} className="bg-gray-800 hover:bg-black text-white font-semibold px-5 py-2 rounded-lg">Next Round</button>
                                )}
                                {matchOver && (
                                    <button onClick={resetMatch} className="bg-gray-800 hover:bg-black text-white font-semibold px-5 py-2 rounded-lg">New Match</button>
                                )}
                            </div>

                            {matchOver && (
                                <div className="mt-4 text-lg">
                                    {overallWinner === 'tie' ? 'Match tied.' : (overallWinner === 'p1' ? 'Player 1 wins the match!' : 'Player 2 wins the match!')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}


