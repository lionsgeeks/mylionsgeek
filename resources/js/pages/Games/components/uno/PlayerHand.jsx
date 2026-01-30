import Card from './Card';
import { getCardImage, isPlayable } from './utils';

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
    isFullscreen = false,
}) {
    if (!hand || hand.length === 0) return null;

    const isMyTurn = currentPlayerIndex === assignedPlayerIndex;
    const handSize = hand.filter((c) => c !== null).length;

    // Desktop layout (horizontal)
    const desktopLayout = (
        <div
            className="scrollbar-hide hidden items-end justify-center gap-1.5 overflow-x-auto px-2 pb-3 sm:gap-2 sm:px-4 sm:pb-6 md:flex"
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
            }}
        >
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
                                zIndex: isMyTurn && playable ? 20 : 10 + displayIndex,
                            }}
                        />
                    );
                })}
        </div>
    );

    // Mobile layout (wrapped)
    const mobileLayout = (
        <div className="flex flex-wrap items-end justify-center gap-1.5 px-2 pb-3 md:hidden">
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
                            className={`relative flex-shrink-0 touch-manipulation transition-all ${
                                isMyTurn && playable && !pendingDraw
                                    ? 'cursor-pointer rounded-md ring-2 ring-yellow-400/60 active:-translate-y-1 active:scale-95'
                                    : 'cursor-not-allowed opacity-60'
                            } ${isDrawnCard ? 'animate-pulse ring-4 ring-green-400/80' : ''}`}
                            style={{
                                zIndex: isMyTurn && playable ? 20 : 10 + displayIndex,
                            }}
                        >
                            <img
                                src={getCardImage(card)}
                                alt={`${card.color || 'Wild'} ${card.value}`}
                                className="h-16 w-12 rounded-md border-2 border-white object-contain shadow-xl"
                                onError={(e) => {
                                    console.error('Failed to load card image:', getCardImage(card));
                                    e.target.src = `https://via.placeholder.com/48x64/333333/ffffff?text=${card.value || 'CARD'}`;
                                }}
                            />
                            {isMyTurn && playable && !pendingDraw && (
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
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
