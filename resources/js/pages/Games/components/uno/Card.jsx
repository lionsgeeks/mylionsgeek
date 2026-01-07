import React from 'react';
import { getCardImage } from './utils';

export default function Card({ card, onClick, disabled = false, isPlayable = false, isDrawnCard = false, className = '', style = {} }) {
    if (!card) return null;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative transition-all touch-manipulation flex-shrink-0 ${
                isPlayable && !disabled
                    ? 'active:scale-95 active:-translate-y-1 sm:hover:scale-105 sm:hover:-translate-y-2 cursor-pointer ring-2 ring-yellow-400/60 rounded-md'
                    : 'opacity-60 cursor-not-allowed'
            } ${isDrawnCard ? 'ring-4 ring-green-400/80 animate-pulse' : ''} ${className}`}
            style={style}
        >
            <img
                src={getCardImage(card)}
                alt={`${card.color || 'Wild'} ${card.value}`}
                className="w-14 h-20 sm:w-16 sm:h-22 md:w-18 md:h-26 object-contain rounded-md border-2 border-white shadow-xl"
                onError={(e) => {
                    console.error('Failed to load card image:', getCardImage(card));
                    e.target.src = `https://via.placeholder.com/72x100/333333/ffffff?text=${card.value || 'CARD'}`;
                }}
            />
            {isPlayable && !disabled && (
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-lg ring-2 ring-white">
                    ✓
                </div>
            )}
        </button>
    );
}





