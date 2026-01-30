import { getCardImage } from './utils';

export default function Card({ card, onClick, disabled = false, isPlayable = false, isDrawnCard = false, className = '', style = {} }) {
    if (!card) return null;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative flex-shrink-0 touch-manipulation transition-all ${
                isPlayable && !disabled
                    ? 'cursor-pointer rounded-md ring-2 ring-yellow-400/60 active:-translate-y-1 active:scale-95 sm:hover:-translate-y-2 sm:hover:scale-105'
                    : 'cursor-not-allowed opacity-60'
            } ${isDrawnCard ? 'animate-pulse ring-4 ring-green-400/80' : ''} ${className}`}
            style={style}
        >
            <img
                src={getCardImage(card)}
                alt={`${card.color || 'Wild'} ${card.value}`}
                className="h-20 w-14 rounded-md border-2 border-white object-contain shadow-xl sm:h-22 sm:w-16 md:h-26 md:w-18"
                onError={(e) => {
                    console.error('Failed to load card image:', getCardImage(card));
                    e.target.src = `https://via.placeholder.com/72x100/333333/ffffff?text=${card.value || 'CARD'}`;
                }}
            />
            {isPlayable && !disabled && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white sm:h-5 sm:w-5 sm:text-xs">
                    ✓
                </div>
            )}
        </button>
    );
}
