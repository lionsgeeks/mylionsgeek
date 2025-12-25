import React from 'react';
import Card from './Card';
import { isPlayable } from './utils';

import React from 'react';
import Card from './Card';
import { isPlayable, getCardImage } from './utils';

export default function PlayerHand({ 
    hand, 
    topCard, 
    currentColor, 
    currentPlayerIndex, 
    assignedPlayerIndex, 
    winner, 
    pendingDraw, 
    drawnCardIndex,
    onCardClick,
    isFullscreen = false
}) {
    if (!hand || hand.length === 0) return null;

    const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
    const handSize = hand.filter(c => c !== null).length;

    // Desktop layout (horizontal)
    const desktopLayout = (
        <div className="hidden md:flex gap-1.5 sm:gap-2 justify-center items-end overflow-x-auto pb-3 sm:pb-6 px-2 sm:px-4 scrollbar-hide" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
        }}>
            {hand
                .map((card, originalIndex) => ({ card, originalIndex }))
                .filter(({ card }) => card !== null)
                .map(({ card, originalIndex }, displayIndex) => {
                    const playable = isPlayable(card, topCard, currentColor);
                    const isDrawnCard = drawnCardIndex === originalIndex;

                    return (
                        <Card
                            key={originalIndex}
                            card={card}
                            onClick={() => {
                                if (isMyTurn && playable && !winner) {
                                    onCardClick(originalIndex);
                                }
                            }}
                            disabled={!isMyTurn || !playable || winner !== null || pendingDraw > 0}
                            isPlayable={playable}
                            isDrawnCard={isDrawnCard}
                            style={{
                                transform: `translateY(${Math.abs(displayIndex - handSize / 2) * -2}px)`,
                                zIndex: isMyTurn && playable ? 20 : 10 + displayIndex
                            }}
                        />
                    );
                })}
        </div>
    );

    // Mobile layout (wrapped)
    const mobileLayout = (
        <div className="flex md:hidden flex-wrap gap-1.5 justify-center items-end pb-3 px-2">
            {hand
                .map((card, originalIndex) => ({ card, originalIndex }))
                .filter(({ card }) => card !== null)
                .map(({ card, originalIndex }, displayIndex) => {
                    const playable = isPlayable(card, topCard, currentColor);
                    const isDrawnCard = drawnCardIndex === originalIndex;

                    return (
                        <button
                            key={originalIndex}
                            onClick={() => {
                                if (isMyTurn && playable && !winner) {
                                    onCardClick(originalIndex);
                                }
                            }}
                            disabled={!isMyTurn || !playable || winner !== null || pendingDraw > 0}
                            className={`relative transition-all touch-manipulation flex-shrink-0 ${
                                isMyTurn && playable && !pendingDraw
                                    ? 'active:scale-95 active:-translate-y-1 cursor-pointer ring-2 ring-yellow-400/60 rounded-md'
                                    : 'opacity-60 cursor-not-allowed'
                            } ${isDrawnCard ? 'ring-4 ring-green-400/80 animate-pulse' : ''}`}
                            style={{
                                zIndex: isMyTurn && playable ? 20 : 10 + displayIndex
                            }}
                        >
                            <img
                                src={getCardImage(card)}
                                alt={`${card.color || 'Wild'} ${card.value}`}
                                className="w-12 h-16 object-contain rounded-md border-2 border-white shadow-xl"
                                onError={(e) => {
                                    console.error('Failed to load card image:', getCardImage(card));
                                    e.target.src = `https://via.placeholder.com/48x64/333333/ffffff?text=${card.value || 'CARD'}`;
                                }}
                            />
                            {isMyTurn && playable && !pendingDraw && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ring-2 ring-white">
                                    ✓
                                </div>
                            )}
                        </button>
                    );
                })}
        </div>
    );

    return (
        <>
            {desktopLayout}
            {mobileLayout}
        </>
    );
}

