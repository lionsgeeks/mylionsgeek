import React from 'react';

export default function Deck({ 
    deckLength, 
    pendingDraw, 
    currentPlayerIndex, 
    assignedPlayerIndex, 
    winner,
    onDraw 
}) {
    const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
    const canDraw = isMyTurn && !winner;

    return (
        <div className="flex flex-col items-center">
            <div className="text-white font-semibold text-[10px] sm:text-xs mb-1.5 sm:mb-2">Draw</div>
            <button
                onClick={onDraw}
                disabled={!canDraw}
                className={`relative w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 rounded-md border-2 border-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-manipulation ${
                    canDraw ? 'active:scale-95 hover:scale-105 cursor-pointer ring-2 ring-yellow-400/50' : ''
                }`}
                style={{
                    transform: 'rotate(-3deg)',
                }}
            >
                <img
                    src="/assets/images/uno-card-images/backofthecardred.png"
                    alt="Draw pile"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center rounded-md';
                        fallback.innerHTML = '<div class="text-white text-[8px] sm:text-[10px] font-bold">UNO</div>';
                        e.target.parentNode.appendChild(fallback);
                    }}
                />
            </button>
            <div className="text-white text-[9px] sm:text-[10px] mt-1 font-medium">{deckLength}</div>
            {pendingDraw > 0 && isMyTurn && (
                <div className="text-red-300 text-[9px] sm:text-[10px] mt-0.5 font-bold bg-red-900/30 px-1.5 py-0.5 rounded">
                    +{pendingDraw}
                </div>
            )}
        </div>
    );
}




