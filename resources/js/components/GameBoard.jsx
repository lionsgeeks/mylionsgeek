import React from 'react';
import Card from './Card';

export default function GameBoard({
    topCard,
    playerHandCount,
    cpuHandCount,
    isPlayerTurn,
    onDraw,
    onRestart,
    score,
}) {
    return (
        <div className="w-full">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 text-white">
                <div className={`px-3 py-1 rounded-md ${!isPlayerTurn ? 'bg-white/20' : 'bg-white/10'}`}>CPU: {cpuHandCount}</div>
                <div className="text-sm">P1 Wins: {score.p1} &nbsp;|&nbsp; CPU Wins: {score.cpu}</div>
                <div className={`${isPlayerTurn ? 'bg-white/20' : 'bg-white/10'} px-3 py-1 rounded-md`}>You: {playerHandCount}</div>
            </div>

            {/* Table */}
            <div className="relative w-full max-w-3xl h-64 mx-auto rounded-3xl bg-gradient-to-br from-sky-900 to-blue-900 border border-blue-700 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-36 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center">
                        {topCard && (
                            <div className={`w-20 h-32 rounded-xl border-2 ${topCard.type==='wild' ? 'bg-gradient-to-br from-gray-800 to-slate-700' : colorClass(topCard.chosenColor || topCard.color)}`}></div>
                        )}
                    </div>
                </div>

                {/* Draw deck button */}
                <div className="absolute right-4 bottom-4">
                    <button onClick={onDraw} className="w-16 h-24 rounded-xl bg-white/20 border-2 border-white/40 text-white font-bold">Deck</button>
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <button onClick={onRestart} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">Restart Game</button>
            </div>
        </div>
    );
}

function colorClass(color) {
    switch (color) {
        case 'red': return 'bg-gradient-to-br from-red-500 to-rose-600';
        case 'green': return 'bg-gradient-to-br from-green-500 to-emerald-600';
        case 'blue': return 'bg-gradient-to-br from-blue-500 to-cyan-600';
        case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-amber-500';
        default: return 'bg-gray-500';
    }
}


