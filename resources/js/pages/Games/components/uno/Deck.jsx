export default function Deck({ deckLength, pendingDraw, currentPlayerIndex, assignedPlayerIndex, winner, onDraw }) {
    const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
    const canDraw = isMyTurn && !winner;

    return (
        <div className="flex flex-col items-center">
            <div className="mb-1.5 text-[10px] font-semibold text-white sm:mb-2 sm:text-xs">Draw</div>
            <button
                onClick={onDraw}
                disabled={!canDraw}
                className={`relative h-16 w-12 touch-manipulation overflow-hidden rounded-md border-2 border-white shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:h-20 sm:w-14 md:h-22 md:w-16 ${
                    canDraw ? 'cursor-pointer ring-2 ring-yellow-400/50 hover:scale-105 active:scale-95' : ''
                }`}
                style={{
                    transform: 'rotate(-3deg)',
                }}
            >
                <img
                    src="/assets/images/uno-card-images/backofthecardred.png"
                    alt="Draw pile"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center rounded-md';
                        fallback.innerHTML = '<div class="text-white text-[8px] sm:text-[10px] font-bold">UNO</div>';
                        e.target.parentNode.appendChild(fallback);
                    }}
                />
            </button>
            <div className="mt-1 text-[9px] font-medium text-white sm:text-[10px]">{deckLength}</div>
            {pendingDraw > 0 && isMyTurn && (
                <div className="mt-0.5 rounded bg-red-900/30 px-1.5 py-0.5 text-[9px] font-bold text-red-300 sm:text-[10px]">+{pendingDraw}</div>
            )}
        </div>
    );
}
