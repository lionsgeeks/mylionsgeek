export default function GameBoard({ topCard, playerHandCount, cpuHandCount, isPlayerTurn, onDraw, onRestart, score }) {
    return (
        <div className="w-full">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between text-white">
                <div className={`rounded-md px-3 py-1 ${!isPlayerTurn ? 'bg-white/20' : 'bg-white/10'}`}>CPU: {cpuHandCount}</div>
                <div className="text-sm">
                    P1 Wins: {score.p1} &nbsp;|&nbsp; CPU Wins: {score.cpu}
                </div>
                <div className={`${isPlayerTurn ? 'bg-white/20' : 'bg-white/10'} rounded-md px-3 py-1`}>You: {playerHandCount}</div>
            </div>

            {/* Table */}
            <div className="relative mx-auto h-64 w-full max-w-3xl overflow-hidden rounded-3xl border border-blue-700 bg-gradient-to-br from-sky-900 to-blue-900 shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-36 w-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10">
                        {topCard && (
                            <div
                                className={`h-32 w-20 rounded-xl border-2 ${topCard.type === 'wild' ? 'bg-gradient-to-br from-gray-800 to-slate-700' : colorClass(topCard.chosenColor || topCard.color)}`}
                            ></div>
                        )}
                    </div>
                </div>

                {/* Draw deck button */}
                <div className="absolute right-4 bottom-4">
                    <button onClick={onDraw} className="h-24 w-16 rounded-xl border-2 border-white/40 bg-white/20 font-bold text-white">
                        Deck
                    </button>
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <button onClick={onRestart} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                    Restart Game
                </button>
            </div>
        </div>
    );
}

function colorClass(color) {
    switch (color) {
        case 'red':
            return 'bg-gradient-to-br from-red-500 to-rose-600';
        case 'green':
            return 'bg-gradient-to-br from-green-500 to-emerald-600';
        case 'blue':
            return 'bg-gradient-to-br from-blue-500 to-cyan-600';
        case 'yellow':
            return 'bg-gradient-to-br from-yellow-400 to-amber-500';
        default:
            return 'bg-gray-500';
    }
}
