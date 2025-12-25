import React from 'react';
import { getCardImage } from './utils';

export default function DiscardPile({ 
    topCard, 
    currentColor, 
    currentPlayer, 
    assignedPlayerIndex, 
    pendingDraw 
}) {
    if (!topCard) return null;

    return (
        <div className="flex flex-col items-center">
            <div className="text-white font-semibold text-[10px] sm:text-xs mb-1.5 sm:mb-2">Discard</div>
            <div className="relative">
                <div className="absolute w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md border-2 border-gray-700"
                    style={{ transform: 'translate(2px, 2px) rotate(-1deg)', zIndex: 0 }}
                />
                <img
                    src={getCardImage(topCard)}
                    alt={`${topCard.color || 'Wild'} ${topCard.value}`}
                    className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-22 object-contain rounded-md border-2 border-white shadow-xl relative z-10"
                    onError={(e) => {
                        console.error('Failed to load card image:', getCardImage(topCard));
                        e.target.src = `https://via.placeholder.com/64x88/333333/ffffff?text=${topCard.value || 'CARD'}`;
                    }}
                />
            </div>

            {/* Current Color Indicator */}
            <div className="mt-2 sm:mt-3 flex flex-col items-center gap-1">
                <div className="text-white text-[9px] sm:text-[10px] font-semibold">Color</div>
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md shadow-lg border-2 border-white ring-1 ring-white/30"
                    style={{
                        backgroundColor: currentColor === 'red' ? '#dc2626' :
                                       currentColor === 'green' ? '#16a34a' :
                                       currentColor === 'blue' ? '#2563eb' :
                                       currentColor === 'yellow' ? '#ca8a04' : '#000'
                    }}
                />
            </div>

            {/* Turn indicator */}
            <div className="mt-1.5 sm:mt-2 text-white text-[9px] sm:text-[10px] text-center px-1.5 py-0.5">
                {currentPlayer && (
                    currentPlayer.id === assignedPlayerIndex ? (
                        <span className="font-bold text-yellow-300">Your turn!</span>
                    ) : (
                        <span className="truncate max-w-[70px] sm:max-w-none block">{currentPlayer.name}'s turn</span>
                    )
                )}
            </div>

            {/* Pending Draw Warning */}
            {pendingDraw > 0 && currentPlayer?.id === assignedPlayerIndex && (
                <div className="mt-1.5 bg-red-600 text-white px-2 py-1 rounded-md font-bold text-[9px] sm:text-[10px] shadow-lg">
                    Draw {pendingDraw}!
                </div>
            )}
        </div>
    );
}



